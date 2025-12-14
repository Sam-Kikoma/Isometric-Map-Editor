import { useEffect, useState, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import type { AssetData } from '../components/editor/types';

export interface UserCursor {
	name: string;
	color: string;
	position: [number, number, number] | null;
}

interface UseCollaborationOptions {
	roomId: string;
	initialAssets?: AssetData[];
	onAssetsChange?: (assets: AssetData[]) => void;
}

interface UseCollaborationReturn {
	assets: AssetData[];
	setAssets: (assets: AssetData[]) => void;
	addAsset: (asset: AssetData) => void;
	removeAsset: (position: [number, number, number]) => void;
	connectedUsers: number;
	isConnected: boolean;
	undo: () => void;
	redo: () => void;
	canUndo: boolean;
	canRedo: boolean;
	userCursors: UserCursor[];
	updateCursor: (position: [number, number, number] | null) => void;
}

export function useCollaboration({
	roomId,
	initialAssets = [],
	onAssetsChange,
}: UseCollaborationOptions): UseCollaborationReturn {
	const [assets, setAssetsState] = useState<AssetData[]>(initialAssets);
	const [connectedUsers, setConnectedUsers] = useState(1);
	const [isConnected, setIsConnected] = useState(false);
	
	const ydocRef = useRef<Y.Doc | null>(null);
	const providerRef = useRef<WebsocketProvider | null>(null);
	const yAssetsRef = useRef<Y.Array<AssetData> | null>(null);
	const undoManagerRef = useRef<Y.UndoManager | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const awarenessRef = useRef<any>(null);
	const isInitializedRef = useRef(false);
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);
	const [userCursors, setUserCursors] = useState<UserCursor[]>([]);

	useEffect(() => {
		// Create Y.js document
		const ydoc = new Y.Doc();
		ydocRef.current = ydoc;

		// Create shared array for assets
		const yAssets = ydoc.getArray<AssetData>('assets');
		yAssetsRef.current = yAssets;

		// Connect via WebSocket - using public y-websocket server
		const wsUrl = 'wss://demos.yjs.dev/ws';
		const provider = new WebsocketProvider(wsUrl, `isoedit-${roomId}`, ydoc);
		providerRef.current = provider;

		// Track connection status
		provider.on('status', (event: { status: string }) => {
			console.log('[Y.js] Connection status:', event.status);
			setIsConnected(event.status === 'connected');
		});

		// Use awareness to track connected users
		const awareness = provider.awareness;
		awarenessRef.current = awareness;
		
		// Generate consistent user info
		const userName = `User-${Math.floor(Math.random() * 1000)}`;
		const userColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
		
		// Set local user info
		awareness.setLocalStateField('user', {
			name: userName,
			color: userColor,
			cursor: null,
		});
		
		// Track awareness changes for user count and cursors
		const awarenessHandler = () => {
			const states = awareness.getStates();
			console.log('[Y.js] Connected users:', states.size);
			setConnectedUsers(states.size);
			
			// Extract cursors from other users
			const cursors: UserCursor[] = [];
			states.forEach((state, clientId) => {
				if (clientId !== awareness.clientID && state.user) {
					cursors.push({
						name: state.user.name || 'Anonymous',
						color: state.user.color || '#888',
						position: state.user.cursor || null,
					});
				}
			});
			setUserCursors(cursors);
		};
		
		awareness.on('change', awarenessHandler);
		
		// Initial check
		awarenessHandler();

		// Initialize with existing assets if this is the first user
		if (initialAssets.length > 0 && yAssets.length === 0) {
			ydoc.transact(() => {
				initialAssets.forEach(asset => yAssets.push([asset]));
			});
		}

		// Observe changes to the shared array
		const observer = () => {
			const newAssets = yAssets.toArray();
			console.log('[Y.js] Assets synced:', newAssets.length);
			setAssetsState(newAssets);
			onAssetsChange?.(newAssets);
		};

		yAssets.observe(observer);
		isInitializedRef.current = true;

		// Set up UndoManager
		const undoManager = new Y.UndoManager(yAssets);
		undoManagerRef.current = undoManager;
		
		// Track undo/redo stack changes
		const updateUndoState = () => {
			setCanUndo(undoManager.undoStack.length > 0);
			setCanRedo(undoManager.redoStack.length > 0);
		};
		undoManager.on('stack-item-added', updateUndoState);
		undoManager.on('stack-item-popped', updateUndoState);

		// Set initial state
		if (yAssets.length > 0) {
			setAssetsState(yAssets.toArray());
		}

		// Cleanup on unmount
		return () => {
			undoManager.destroy();
			awareness.off('change', awarenessHandler);
			yAssets.unobserve(observer);
			provider.disconnect();
			provider.destroy();
			ydoc.destroy();
			isInitializedRef.current = false;
		};
	}, [roomId]); // Only recreate when roomId changes

	// Replace all assets
	const setAssets = useCallback((newAssets: AssetData[]) => {
		const yAssets = yAssetsRef.current;
		const ydoc = ydocRef.current;
		if (!yAssets || !ydoc) return;

		ydoc.transact(() => {
			yAssets.delete(0, yAssets.length);
			newAssets.forEach(asset => yAssets.push([asset]));
		});
	}, []);

	// Add a single asset
	const addAsset = useCallback((asset: AssetData) => {
		const yAssets = yAssetsRef.current;
		if (!yAssets) return;
		yAssets.push([asset]);
	}, []);

	// Remove asset at specific position
	const removeAsset = useCallback((position: [number, number, number]) => {
		const yAssets = yAssetsRef.current;
		const ydoc = ydocRef.current;
		if (!yAssets || !ydoc) return;

		ydoc.transact(() => {
			// Find and remove the asset at this position
			const assets = yAssets.toArray();
			const index = assets.findIndex(
				(asset) =>
					asset.position[0] === position[0] &&
					asset.position[1] === position[1] &&
					asset.position[2] === position[2]
			);
			if (index !== -1) {
				yAssets.delete(index, 1);
			}
		});
	}, []);

	// Undo/Redo functions
	const undo = useCallback(() => {
		undoManagerRef.current?.undo();
	}, []);

	const redo = useCallback(() => {
		undoManagerRef.current?.redo();
	}, []);

	// Update local cursor position
	const updateCursor = useCallback((position: [number, number, number] | null) => {
		const awareness = awarenessRef.current;
		if (awareness) {
			const currentState = awareness.getLocalState();
			if (currentState?.user) {
				awareness.setLocalStateField('user', {
					...currentState.user,
					cursor: position,
				});
			}
		}
	}, []);

	return {
		assets,
		setAssets,
		addAsset,
		removeAsset,
		connectedUsers,
		isConnected,
		undo,
		redo,
		canUndo,
		canRedo,
		userCursors,
		updateCursor,
	};
}

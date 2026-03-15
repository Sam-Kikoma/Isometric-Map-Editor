-- Create a default user: "wasabi"
INSERT INTO "User" ("id", "email", "password", "username", "createdAt", "updatedAt") 
VALUES (
    'f69c2564-6a71-4ccd-ae1d-97f273de4c61', 
    'wasabi@email.com', 
    '$2b$05$G6ZBL7HuNYjCnMBFf4kjTedCpsbqx1GszwW3fclaKShyi08qNPxsy', 
    'wasabi', 
    now(), 
    now()
) ON CONFLICT (email) DO NOTHING;
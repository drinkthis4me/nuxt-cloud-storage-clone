-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPLOADING',
    "isFolder" BOOLEAN NOT NULL DEFAULT false,
    "parentFolderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "File_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FileChunk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT NOT NULL,
    "partNumber" INTEGER NOT NULL,
    "etag" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "FileChunk_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Share" (
    "userId" INTEGER NOT NULL,
    "fileId" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'VIEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("userId", "fileId"),
    CONSTRAINT "Share_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Share_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "File_fingerprint_idx" ON "File"("fingerprint");

-- CreateIndex
CREATE INDEX "File_ownerId_idx" ON "File"("ownerId");

-- CreateIndex
CREATE INDEX "File_parentFolderId_idx" ON "File"("parentFolderId");

-- CreateIndex
CREATE INDEX "FileChunk_fileId_idx" ON "FileChunk"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "FileChunk_fileId_partNumber_key" ON "FileChunk"("fileId", "partNumber");

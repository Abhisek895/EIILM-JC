$envs = @{
    "POSTGRES_URL" = "postgres://9352450170d3f05d3da9068d697e1bb14ea78d5858dbd463a206ab1291697ed8:sk_yLaf1OsiHQAwbmymecm8F@db.prisma.io:5432/postgres?sslmode=require"
    "PRISMA_DATABASE_URL" = "postgres://9352450170d3f05d3da9068d697e1bb14ea78d5858dbd463a206ab1291697ed8:sk_yLaf1OsiHQAwbmymecm8F@db.prisma.io:5432/postgres?sslmode=require"
    "BLOB_READ_WRITE_TOKEN" = "vercel_blob_rw_AFFJp3AMkUftPkUN_60ayZLpsEWIXKRSFfiCAYP2P4l5eD7"
    "BLOB_STORE_ID" = "store_AFFJp3AMkUftPkUN"
    "FRONTEND_URL" = "https://eiilm-jc.vercel.app,https://frontend-eiilm-web.vercel.app"
    "JWT_SECRET" = "e8f4c9a2d1b7e635482910f5c3b8a7d9e1f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2"
    "JWT_REFRESH_SECRET" = "7a1b3c5d9e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b"
    "APP_NAME" = "EIILM Kolkata Jalpaiguri Campus ERP"
}

foreach ($key in $envs.Keys) {
    Write-Host "Setting $key..."
    $envs[$key] | npx vercel env add $key production --force
}
Write-Host "All envs set!"


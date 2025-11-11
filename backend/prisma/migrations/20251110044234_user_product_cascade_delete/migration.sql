-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_managerId_fkey";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

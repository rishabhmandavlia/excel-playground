import { Elysia } from "elysia";
import { excelMasterModule } from "./modules/excel-master/index";
new Elysia({ prefix: "/api" }).use(excelMasterModule).listen(3001);
console.log("Excel API listening on http://localhost:3001");

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import ingredientsRouter from "./ingredients";
import adminIngredientsRouter from "./admin/ingredients";
import adminRecipesRouter from "./admin/recipes";
import userIngredientsRouter from "./user/ingredients";
import userRecipesRouter from "./user/recipes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(ingredientsRouter);
router.use(adminIngredientsRouter);
router.use(adminRecipesRouter);
router.use(userIngredientsRouter);
router.use(userRecipesRouter);

export default router;

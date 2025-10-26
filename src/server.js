import express, { Router } from "express";
import dotenv from "dotenv";
import startAdmin from "./admin/admin.js";
import { UserModule } from "./user/user.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { initDb } from "./db/init.js";
import { pool } from "./db/index.js";
import { sessionMiddleware } from "./sessions/session.config.js";
import { SessionModule } from "./sessions/session.module.js";
import { MulterModule } from "./multer/multer.module.js";
import { PostModule } from "./posts/post.module.js";
import { CategoryModule } from "./categories/category.module.js";
import { CommentModule } from "./comments/comment.module.js";
import { SubscriptionModule } from "./subscription/subscription.module.js";
import { FavoriteModule } from "./favorite/favorite.module.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// Получаем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());
app.use(sessionMiddleware);

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  })
);

// Статическая раздача загруженных файлов
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const api = Router();

api.get("/health", (_req, res) => res.json({ status: "ok" }));

api.get("/debug/time", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

MulterModule(express, app);
UserModule(api);
SessionModule(api);
AuthModule(api);
CategoryModule(api);
PostModule(api);
CommentModule(api);
FavoriteModule(api);
SubscriptionModule(api);

app.use("/api", api);

async function start() {
  try {
    await initDb();
    await startAdmin(app);

    const port = Number(process.env.APP_PORT || 3000);
    app.listen(port, () => console.log(`API running on :${port}`));
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

start();

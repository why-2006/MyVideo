import type { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";
import { db } from "./db.service";

export interface DbUser extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  name: string;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const [rows] = await db.execute<DbUser[]>(
    "SELECT id, email, password, name, username FROM users WHERE email = ? LIMIT 1",
    [email],
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

export async function createUser(
  email: string,
  password: string,
  name: string,
): Promise<number> {
  const hashedPassword = await bcrypt.hash(password, 10);
  const username = email.split("@")[0];
  const [result] = await db.execute<ResultSetHeader>(
    "INSERT INTO users (email, password, name, username) VALUES (?, ?, ?, ?)",
    [email, hashedPassword, name, username],
  );

  return result.insertId;
}

export async function comparePassword(
  inputPassword: string,
  storedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(inputPassword, storedPassword);
}

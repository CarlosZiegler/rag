import { customAlphabet } from "nanoid";
import { clsx, type ClassValue } from "clsx";
import { v7 as uuidv7 } from "uuid";

import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

export const uuid = () => nanoid();

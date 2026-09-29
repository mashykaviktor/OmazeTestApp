export type DrawType = "house" | "early_bird" | "monthly_millionaire";

export type Draw = {
  id: string;
  title: string;
  type: DrawType;
  imageUrl: string;
  endsAt: string;
};

export type Entry = {
  id: string;
  drawId: string;
  userId: string;
  codes: string[];
  enteredAt: string;
};

export type UserDraw = {
  draw: Draw;
  isActive: boolean;
  codes: string[];
  totalCodes: number;
};

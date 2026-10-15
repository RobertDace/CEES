import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Sesi otentikasi server berhasil ditutup.",
  });

  // Hapus cookie admin dan member
  response.cookies.set({
    name: "cees_admin_token",
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  response.cookies.set({
    name: "cees_member_token",
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}

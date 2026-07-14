import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { assertSameOrigin, safeError } from "@/lib/security";

const schema=z.object({name:z.string().trim().min(2).max(120),email:z.email().transform(v=>v.toLowerCase()),password:z.string().min(10).max(128),role:z.enum(["admin","docente"])});
export async function POST(request:NextRequest){try{assertSameOrigin(request);const actor=await getSession();if(!actor||actor.role!=="admin")return NextResponse.json({message:"No autorizado."},{status:403});const input=schema.parse(await request.json());const passwordHash=await hash(input.password,12);const rows=await getSql()`INSERT INTO users(email,full_name,password_hash,role) VALUES(${input.email},${input.name},${passwordHash},${input.role}) RETURNING id`;await audit({userId:actor.id,action:"user.created",entity:"user",entityId:String(rows[0].id),metadata:{role:input.role}});return NextResponse.json({id:rows[0].id},{status:201});}catch(error){return NextResponse.json({message:(error as {code?:string}).code==="23505"?"El correo ya existe.":safeError(error)},{status:400});}}

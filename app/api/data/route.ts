import { NormalizedTransaction } from "@/models/transactions";
import { NextResponse } from "next/server"

export async function data() {
    try {
        const response = await fetch("http://192.168.68.75:3090/api/data/transactions");
        const transactions: NormalizedTransaction[] = await response.json();
        return NextResponse.json({ data: transactions })
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

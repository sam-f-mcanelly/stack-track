import { NormalizedTransaction } from "@/models/transactions";
import { NextResponse } from "next/server"

export async function data() {
    try {
        const response = await fetch("http://localhost:90/api/data");
        const transactions: NormalizedTransaction[] = await response.json();
        return NextResponse.json({ data: transactions })
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

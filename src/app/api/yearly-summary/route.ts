import { NextRequest, NextResponse } from "next/server";
import { getConsumptionCollection } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get("year") || new Date().getFullYear().toString();
    
    const collection = await getConsumptionCollection();
    
    // Daten für das ausgewählte Jahr abrufen
    const data = await collection
      .find({
        year: parseInt(year),
      })
      .sort({ month: 1 })
      .toArray();
    
    // Übertrag vom Vorjahr finden
    const balanceForward = await collection.findOne({
      year: parseInt(year),
      balanceForward: { $exists: true },
    });

    // Monats-Daten für die Anzeige formatieren
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthData = data.find((d) => d.month === i + 1);
      
      return {
        month: i + 1,
        price: monthData?.price || 0,
        consumption: monthData?.consumption || 0,
        cost: monthData?.price * monthData?.consumption || 0,
        paid: monthData?.paid || 0,
        balance: 0, // Wird später berechnet
      };
    });

    // Gesamtstatistik berechnen
    let currentBalance = balanceForward?.amount || 0;
    let totalConsumption = 0;
    let totalCost = 0;
    let totalPaid = 0;

    // Balance für jeden Monat berechnen und Gesamtwerte akkumulieren
    monthlyData.forEach((month) => {
      currentBalance = currentBalance - month.cost + month.paid;
      month.balance = currentBalance;
      
      totalConsumption += month.consumption;
      totalCost += month.cost;
      totalPaid += month.paid;
    });

    return NextResponse.json({
      success: true,
      yearlyData: {
        year: parseInt(year),
        monthlyData,
        summary: {
          consumption: totalConsumption,
          cost: totalCost,
          paid: totalPaid,
          balance: currentBalance,
          balanceForward: balanceForward?.amount || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching yearly summary:", error);
    return NextResponse.json(
      { success: false, error: "Fehler beim Abrufen der Jahresübersicht" },
      { status: 500 }
    );
  }
}
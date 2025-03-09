import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getConsumptionCollection } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { year, amount } = body;

    // Daten validieren
    if (!year || amount === undefined) {
      return NextResponse.json(
        { success: false, error: "Fehlende Felder" },
        { status: 400 }
      );
    }

    const collection = await getConsumptionCollection();

    // Prüfen, ob ein Übertrag für dieses Jahr bereits existiert
    const existingEntry = await collection.findOne({
      year: parseInt(year),
      balanceForward: { $exists: true },
    });

    if (existingEntry) {
      // Bestehenden Eintrag aktualisieren
      await collection.updateOne(
        { _id: existingEntry._id },
        {
          $set: {
            amount: parseFloat(amount),
          },
        }
      );
    } else {
      // Neuen Eintrag erstellen
      await collection.insertOne({
        year: parseInt(year),
        balanceForward: true,
        amount: parseFloat(amount),
      });
    }

    return NextResponse.json({ success: true, message: "Übertrag gespeichert" });
  } catch (error) {
    console.error("Error setting balance forward:", error);
    return NextResponse.json(
      { success: false, error: "Fehler beim Speichern des Übertrags" },
      { status: 500 }
    );
  }
}
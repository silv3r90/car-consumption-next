import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getConsumptionCollection } from "@/lib/mongodb";

// GET-Methode zum Abrufen der Verbrauchsdaten
export async function GET(request: NextRequest) {
  try {
    const collection = await getConsumptionCollection();
    const data = await collection.find({}).toArray();
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching consumption data:", error);
    return NextResponse.json(
      { success: false, error: "Fehler beim Abrufen der Verbrauchsdaten" },
      { status: 500 }
    );
  }
}

// POST-Methode zum Hinzufügen von Verbrauchsdaten (nur für Admins)
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
    const { month, year, price, consumption, paid } = body;

    // Daten validieren
    if (
      !month ||
      !year ||
      price === undefined ||
      consumption === undefined ||
      paid === undefined
    ) {
      return NextResponse.json(
        { success: false, error: "Fehlende Felder" },
        { status: 400 }
      );
    }

    const collection = await getConsumptionCollection();

    // Prüfen, ob ein Eintrag für diesen Monat und dieses Jahr bereits existiert
    const existingEntry = await collection.findOne({
      month: parseInt(month),
      year: parseInt(year),
      balanceForward: { $exists: false }, // Keine Überträge anzeigen
    });

    if (existingEntry) {
      // Bestehenden Eintrag aktualisieren
      await collection.updateOne(
        { _id: existingEntry._id },
        {
          $set: {
            price: parseFloat(price),
            consumption: parseFloat(consumption),
            paid: parseFloat(paid),
          },
        }
      );
    } else {
      // Neuen Eintrag erstellen
      await collection.insertOne({
        month: parseInt(month),
        year: parseInt(year),
        price: parseFloat(price),
        consumption: parseFloat(consumption),
        paid: parseFloat(paid),
      });
    }

    return NextResponse.json({ success: true, message: "Daten gespeichert" });
  } catch (error) {
    console.error("Error adding consumption data:", error);
    return NextResponse.json(
      { success: false, error: "Fehler beim Speichern der Daten" },
      { status: 500 }
    );
  }
}
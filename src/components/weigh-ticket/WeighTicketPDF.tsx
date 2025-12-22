import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
    padding: "0.4in",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "3px solid #059669",
    paddingBottom: 8,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 90,
    height: 45,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  headerRight: {
    textAlign: "right",
  },
  ticketLabel: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Courier",
    borderBottom: "2px solid #d1d5db",
    padding: "3px 6px",
    minWidth: 110,
    marginTop: 3,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    borderBottom: "2px solid #d1d5db",
    minHeight: 18,
    padding: "2px 0",
    fontSize: 9,
  },
  section: {
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  weightsSection: {
    border: "2px solid #059669",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  weightsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#047857",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 8,
  },
  weightBox: {
    flex: 1,
    textAlign: "center",
  },
  weightLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  weightValue: {
    border: "2px solid #d1d5db",
    borderRadius: 3,
    minHeight: 32,
    backgroundColor: "white",
    padding: 6,
    fontSize: 11,
    fontWeight: "bold",
  },
  netWeightValue: {
    border: "2px solid #059669",
    borderRadius: 3,
    minHeight: 32,
    backgroundColor: "#ecfdf5",
    padding: 6,
    fontSize: 11,
    fontWeight: "bold",
    color: "#047857",
  },
  weightUnit: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 2,
  },
  netWeightUnit: {
    fontSize: 8,
    color: "#059669",
    marginTop: 2,
  },
  notesBox: {
    border: "2px solid #e5e7eb",
    borderRadius: 3,
    minHeight: 35,
    padding: 6,
    marginBottom: 8,
  },
  signatures: {
    flexDirection: "row",
    gap: 24,
    paddingTop: 10,
    borderTop: "1px solid #e5e7eb",
    marginBottom: 8,
  },
  signatureLine: {
    borderBottom: "2px solid #9ca3af",
    minHeight: 28,
    marginBottom: 3,
  },
  signatureLabel: {
    fontSize: 8,
    color: "#4b5563",
  },
  footer: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: 6,
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  footerSmall: {
    fontSize: 7,
    color: "#d1d5db",
    marginTop: 2,
  },
});

type WeighTicketPDFProps = {
  ticketNumber?: string;
  date?: string;
  timeIn?: string;
  timeOut?: string;
  carrierCompany?: string;
  driverName?: string;
  truckNumber?: string;
  trailerNumber?: string;
  referenceNumber?: string;
  materialType?: string;
  origin?: string;
  destination?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  notes?: string;
};

export function WeighTicketPDF({
  ticketNumber = "",
  date = "",
  timeIn = "",
  timeOut = "",
  carrierCompany = "",
  driverName = "",
  truckNumber = "",
  trailerNumber = "",
  referenceNumber = "",
  materialType = "",
  origin = "",
  destination = "",
  grossWeight,
  tareWeight,
  netWeight,
  notes = "",
}: WeighTicketPDFProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatWeight = (weight?: number) => {
    if (weight === undefined || weight === null || isNaN(weight)) return "";
    return new Intl.NumberFormat("en-US").format(Math.round(weight));
  };

  const formatTons = (pounds?: number) => {
    if (pounds === undefined || pounds === null || isNaN(pounds)) return "";
    return (pounds / 2000).toFixed(2);
  };

  const originDestination = [origin, destination].filter(Boolean).join(" / ") || "";

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Logo - react-pdf requires absolute URLs, so we'll make it optional for now */}
            <Text style={styles.title}>WEIGH TICKET</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.ticketLabel}>Ticket #</Text>
            <Text style={styles.ticketNumber}>{ticketNumber || "________"}</Text>
          </View>
        </View>

        {/* Date and Time Row */}
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Date</Text>
            <Text style={styles.fieldValue}>{formatDate(date)}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Time In</Text>
            <Text style={styles.fieldValue}>{timeIn || ""}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Time Out</Text>
            <Text style={styles.fieldValue}>{timeOut || ""}</Text>
          </View>
        </View>

        {/* Carrier / Driver Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Carrier / Driver Information</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Carrier / Company Name</Text>
              <Text style={styles.fieldValue}>{carrierCompany || ""}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Driver Name</Text>
              <Text style={styles.fieldValue}>{driverName || ""}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Truck # / License Plate</Text>
              <Text style={styles.fieldValue}>{truckNumber || ""}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Trailer #</Text>
              <Text style={styles.fieldValue}>{trailerNumber || ""}</Text>
            </View>
          </View>
        </View>

        {/* Load Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Load Information</Text>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Reference # / BOL #</Text>
              <Text style={styles.fieldValue}>{referenceNumber || ""}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Material Type</Text>
              <Text style={styles.fieldValue}>{materialType || ""}</Text>
            </View>
          </View>
          <View style={{ marginTop: 2 }}>
            <Text style={styles.fieldLabel}>Origin / Destination</Text>
            <Text style={styles.fieldValue}>{originDestination || ""}</Text>
          </View>
        </View>

        {/* Scale Weights Section */}
        <View style={styles.weightsSection}>
          <Text style={styles.weightsTitle}>Scale Weights</Text>
          <View style={styles.row}>
            <View style={styles.weightBox}>
              <Text style={styles.weightLabel}>Gross Weight</Text>
              <View style={styles.weightValue}>
                <Text>{formatWeight(grossWeight)}</Text>
              </View>
              <Text style={styles.weightUnit}>lbs</Text>
            </View>
            <View style={styles.weightBox}>
              <Text style={styles.weightLabel}>Tare Weight</Text>
              <View style={styles.weightValue}>
                <Text>{formatWeight(tareWeight)}</Text>
              </View>
              <Text style={styles.weightUnit}>lbs</Text>
            </View>
            <View style={styles.weightBox}>
              <Text style={[styles.weightLabel, { color: "#047857" }]}>Net Weight</Text>
              <View style={styles.netWeightValue}>
                <Text>{formatWeight(netWeight)}</Text>
              </View>
              <Text style={styles.netWeightUnit}>lbs</Text>
            </View>
          </View>
          <View style={{ borderTop: "1px solid #e5e7eb", marginTop: 8, paddingTop: 8, flexDirection: "row", gap: 12 }}>
            <View style={[styles.field, { textAlign: "center" }]}>
              <Text style={styles.fieldLabel}>Net Weight (Tons)</Text>
              <Text style={styles.fieldValue}>{formatTons(netWeight)}</Text>
            </View>
            <View style={[styles.field, { textAlign: "center" }]}>
              <Text style={styles.fieldLabel}>Scale Operator Initials</Text>
              <Text style={styles.fieldValue}></Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View>
          <Text style={styles.fieldLabel}>Notes / Comments</Text>
          <View style={styles.notesBox}>
            <Text>{notes || ""}</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatures}>
          <View style={styles.field}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Driver Signature</Text>
          </View>
          <View style={styles.field}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>SSW Representative Signature</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Soil Seed & Water • soilseedandwater.com</Text>
          <Text style={styles.footerSmall}>This ticket is valid for the date shown above. Retain copy for your records.</Text>
        </View>
      </Page>
    </Document>
  );
}


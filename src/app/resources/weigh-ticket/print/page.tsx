import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSW Weigh Ticket",
};

export default function WeighTicketPrintPage() {
  // Generate ticket number prefix based on current date
  const today = new Date();
  const datePrefix = `${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}${today.getFullYear().toString().slice(-2)}`;
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <style>{`
        @page {
          size: letter;
          margin: 0.75in;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          * {
            margin: 0;
            padding: 0;
          }
        }

        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
      <div
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          fontSize: "11px",
          color: "#111827",
          background: "white",
          maxWidth: "7.5in",
          margin: "0 auto",
          padding: "0.5in",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "3px solid #059669",
            paddingBottom: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ssw-logo.png"
              alt="SSW"
              style={{ width: "90px", height: "45px", objectFit: "contain" }}
            />
            <span style={{ fontSize: "24px", fontWeight: "bold", color: "#111827" }}>
              WEIGH TICKET
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "9px",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Ticket #
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                fontFamily: "'Courier New', monospace",
                borderBottom: "2px solid #d1d5db",
                padding: "4px 8px",
                minWidth: "120px",
                marginTop: "4px",
              }}
            >
              {datePrefix}-____
            </div>
          </div>
        </div>

        {/* Date and Time Row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "14px" }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#4b5563",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Date
            </div>
            <div
              style={{
                borderBottom: "2px solid #d1d5db",
                minHeight: "24px",
                padding: "4px 0",
                fontSize: "10px",
                color: "#9ca3af",
              }}
            >
              {dateStr}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#4b5563",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Time In
            </div>
            <div
              style={{
                borderBottom: "2px solid #d1d5db",
                minHeight: "24px",
                padding: "4px 0",
              }}
            ></div>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#4b5563",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Time Out
            </div>
            <div
              style={{
                borderBottom: "2px solid #d1d5db",
                minHeight: "24px",
                padding: "4px 0",
              }}
            ></div>
          </div>
        </div>

        {/* Carrier / Driver Info Section */}
        <div
          style={{
            background: "#f9fafb",
            borderRadius: "6px",
            padding: "14px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            Carrier / Driver Information
          </div>
          <div style={{ display: "flex", gap: "16px", marginBottom: "14px" }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#4b5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                Carrier / Company Name
              </div>
              <div
                style={{
                  borderBottom: "2px solid #d1d5db",
                  minHeight: "24px",
                  padding: "4px 0",
                }}
              ></div>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#4b5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                Driver Name
              </div>
              <div
                style={{
                  borderBottom: "2px solid #d1d5db",
                  minHeight: "24px",
                  padding: "4px 0",
                }}
              ></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#4b5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                Truck # / License Plate
              </div>
              <div
                style={{
                  borderBottom: "2px solid #d1d5db",
                  minHeight: "24px",
                  padding: "4px 0",
                }}
              ></div>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#4b5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                Trailer #
              </div>
              <div
                style={{
                  borderBottom: "2px solid #d1d5db",
                  minHeight: "24px",
                  padding: "4px 0",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Load Info Section */}
        <div
          style={{
            background: "#f9fafb",
            borderRadius: "6px",
            padding: "14px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            Load Information
          </div>
          <div style={{ display: "flex", gap: "16px", marginBottom: "14px" }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#4b5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                Reference # / BOL #
              </div>
              <div
                style={{
                  borderBottom: "2px solid #d1d5db",
                  minHeight: "24px",
                  padding: "4px 0",
                }}
              ></div>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#4b5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                Material Type
              </div>
              <div
                style={{
                  borderBottom: "2px solid #d1d5db",
                  minHeight: "24px",
                  padding: "4px 0",
                }}
              ></div>
            </div>
          </div>
          <div style={{ marginTop: "4px" }}>
            <div
              style={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#4b5563",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Origin / Destination
            </div>
            <div
              style={{
                borderBottom: "2px solid #d1d5db",
                minHeight: "24px",
                padding: "4px 0",
              }}
            ></div>
          </div>
        </div>

        {/* Scale Weights Section */}
        <div
          style={{
            border: "2px solid #059669",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#047857",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              textAlign: "center",
              marginBottom: "14px",
            }}
          >
            Scale Weights
          </div>
          <div style={{ display: "flex", gap: "24px", marginBottom: "14px" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#4b5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "6px",
                }}
              >
                Gross Weight
              </div>
              <div
                style={{
                  border: "2px solid #d1d5db",
                  borderRadius: "4px",
                  minHeight: "40px",
                  background: "white",
                }}
              ></div>
              <div style={{ fontSize: "9px", color: "#9ca3af", marginTop: "4px" }}>lbs</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#4b5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "6px",
                }}
              >
                Tare Weight
              </div>
              <div
                style={{
                  border: "2px solid #d1d5db",
                  borderRadius: "4px",
                  minHeight: "40px",
                  background: "white",
                }}
              ></div>
              <div style={{ fontSize: "9px", color: "#9ca3af", marginTop: "4px" }}>lbs</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#047857",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "6px",
                }}
              >
                Net Weight
              </div>
              <div
                style={{
                  border: "2px solid #059669",
                  borderRadius: "4px",
                  minHeight: "40px",
                  background: "#ecfdf5",
                }}
              ></div>
              <div style={{ fontSize: "9px", color: "#059669", marginTop: "4px" }}>lbs</div>
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              marginTop: "12px",
              paddingTop: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 600,
                    color: "#4b5563",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                  }}
                >
                  Net Weight (Tons)
                </div>
                <div
                  style={{
                    borderBottom: "2px solid #d1d5db",
                    minHeight: "24px",
                    padding: "4px 0",
                  }}
                ></div>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 600,
                    color: "#4b5563",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                  }}
                >
                  Scale Operator Initials
                </div>
                <div
                  style={{
                    borderBottom: "2px solid #d1d5db",
                    minHeight: "24px",
                    padding: "4px 0",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: "14px" }}>
          <div
            style={{
              fontSize: "9px",
              fontWeight: 600,
              color: "#4b5563",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "4px",
            }}
          >
            Notes / Comments
          </div>
          <div
            style={{
              border: "2px solid #e5e7eb",
              borderRadius: "4px",
              minHeight: "50px",
              padding: "8px",
            }}
          ></div>
        </div>

        {/* Signatures */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            paddingTop: "16px",
            borderTop: "1px solid #e5e7eb",
            marginBottom: "24px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                borderBottom: "2px solid #9ca3af",
                minHeight: "36px",
                marginBottom: "4px",
              }}
            ></div>
            <div style={{ fontSize: "9px", color: "#4b5563" }}>Driver Signature</div>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                borderBottom: "2px solid #9ca3af",
                minHeight: "36px",
                marginBottom: "4px",
              }}
            ></div>
            <div style={{ fontSize: "9px", color: "#4b5563" }}>SSW Representative Signature</div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "9px", color: "#9ca3af" }}>
            Soil Seed & Water &bull; soilseedandwater.com
          </div>
          <div style={{ fontSize: "8px", color: "#d1d5db", marginTop: "4px" }}>
            This ticket is valid for the date shown above. Retain copy for your records.
          </div>
        </div>
      </div>
    </>
  );
}

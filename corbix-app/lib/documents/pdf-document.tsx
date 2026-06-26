import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { calculateDocumentTotal } from "@/lib/documents/calculate-totals";
import type { Client, Document as CorbixDocument } from "@/types/database";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 6 },
  muted: { color: "#666", marginBottom: 4 },
  row: { display: "flex", flexDirection: "row", justifyContent: "space-between" },
  section: { marginTop: 16 },
  heading: { fontSize: 13, marginBottom: 6 },
  tableHead: { fontWeight: 700, marginBottom: 6 },
  line: { borderBottom: "1 solid #ddd", marginVertical: 8 },
});

type Props = {
  document: CorbixDocument;
  client: Client | null;
};

export function DocumentPdf({ document, client }: Props) {
  const total = calculateDocumentTotal(document.line_items || []);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Corbrix</Text>
        <Text style={styles.muted}>{document.type.toUpperCase()}</Text>
        <Text>Document ID: {document.id}</Text>
        <Text style={styles.muted}>Status: {document.status}</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>Client</Text>
          <Text>{client?.client_name ?? "N/A"}</Text>
          <Text>{client?.company_name ?? ""}</Text>
          <Text>{client?.email ?? ""}</Text>
          <Text>{client?.phone ?? ""}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Line Items</Text>
          <View style={[styles.row, styles.tableHead]}>
            <Text>Description</Text>
            <Text>Total</Text>
          </View>
          {document.line_items.map((item, index) => (
            <View key={`${item.description}-${index}`} style={styles.row}>
              <Text>
                {item.description} x{item.quantity} @ {item.unit_price}
              </Text>
              <Text>{item.total.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.line} />
          <View style={styles.row}>
            <Text>Total</Text>
            <Text>{total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Terms</Text>
          <Text>{document.terms || "N/A"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Notes</Text>
          <Text>{document.notes || "N/A"}</Text>
        </View>
      </Page>
    </Document>
  );
}

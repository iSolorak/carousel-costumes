import type { Metadata } from "next";
import PageBackdrop from "@/components/PageBackdrop";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from "@/lib/site";

export const metadata: Metadata = {
  title: "Σχετικά με εμάς | Βιοτεχνία Στολών Νέο Ηράκλειο",
  description:
    "Βιοτεχνία στολών στο Νέο Ηράκλειο με 10+ χρόνια εμπειρίας. Στολές για σχολεία της Αθήνας, Καρναβάλι Πάτρας και events. Ζητήστε προσφορά.",
  alternates: { canonical: "/about" },
};

const REASONS = [
  ["Πάνω από 10 χρόνια εμπειρία", "στις στολές."],
  ["Βιοτεχνία, όχι μεταπωλητής:", "ράβουμε εμείς στο Νέο Ηράκλειο."],
  ["Άνετα και ανθεκτικά υφάσματα", "που αντέχουν μια ολόκληρη μέρα."],
  [
    "Μικρές και μεγάλες παραγγελίες,",
    "από λίγα κομμάτια μέχρι ολόκληρα σχολεία και ομάδες.",
  ],
  ["Δικό σας θέμα ή χαρακτήρας,", "κατά παραγγελία."],
  [
    "Απευθείας επικοινωνία",
    "με αυτούς που ράβουν την παραγγελία σας.",
  ],
] as const;

const FAQ = [
  ["Πού βρίσκεται η βιοτεχνία;", "Στο Νέο Ηράκλειο."],
  ["Πόσα χρόνια λειτουργείτε;", "Πάνω από 10 χρόνια."],
  [
    "Φτιάχνετε στολές για σχολεία;",
    "Ναι. Συνεργαζόμαστε με σχολεία σε όλη την Αθήνα και όχι μόνο.",
  ],
  [
    "Φτιάχνετε στολές για το Καρναβάλι της Πάτρας;",
    "Ναι, και για events και εκδηλώσεις.",
  ],
  [
    "Φτιάχνετε στολές κατά παραγγελία;",
    "Ναι, σε δικό σας θέμα ή χαρακτήρα.",
  ],
] as const;

const h2 = "font-display text-xl text-fg sm:text-2xl";
const p = "mt-4 text-base leading-relaxed text-muted";

export default function AboutPage() {
  return (
    <>
      <PageBackdrop />
      <section
        lang="el"
        className="mx-auto flex max-w-2xl flex-col gap-14 px-5 pb-24 pt-32 sm:px-8"
      >
        <header>
          <h1 className="font-display text-3xl text-fg sm:text-4xl">
            Βιοτεχνία Στολών στο Νέο Ηράκλειο
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Είμαστε βιοτεχνία στολών στο Νέο Ηράκλειο. Εδώ και πάνω από 10
            χρόνια ράβουμε στολές για σχολεία, για το Καρναβάλι της Πάτρας και
            για events.
          </p>
        </header>

        <div>
          <h2 className={h2}>Ποιοι είμαστε</h2>
          <p className={p}>
            Η Carousel Costumes είναι βιοτεχνία με έδρα το Νέο Ηράκλειο και
            πάνω από 10 χρόνια εμπειρίας. Σχεδιάζουμε και ράβουμε τις στολές
            μας οι ίδιοι, από την επιλογή του υφάσματος μέχρι το τελικό ράψιμο.
            Επειδή παράγουμε εμείς, ελέγχουμε την ποιότητα σε κάθε βήμα και
            προσαρμόζουμε κάθε παραγγελία στις ανάγκες σας.
          </p>
        </div>

        <div>
          <h2 className={h2}>Στολές για σχολεία της Αθήνας και όχι μόνο</h2>
          <p className={p}>
            Συνεργαζόμαστε εδώ και χρόνια με σχολεία σε όλη την Αθήνα και όχι
            μόνο. Ξέρουμε τι χρειάζεται μια σχολική γιορτή ή παράσταση: πολλές
            στολές της ίδιας γραμμής, σωστά μεγέθη, τήρηση προθεσμιών και τιμές
            που χωράνε στον προϋπολογισμό. Ορίζουμε ημερομηνία παράδοσης πριν
            ξεκινήσουμε και τη σεβόμαστε.
          </p>
        </div>

        <div>
          <h2 className={h2}>Στολές για Καρναβάλι Πάτρας και events</h2>
          <p className={p}>
            Φτιάχνουμε στολές για ομάδες και παρέες που συμμετέχουν στο
            Καρναβάλι της Πάτρας, καθώς και για events, εκδηλώσεις και θεματικά
            πάρτι. Σας δίνουμε στολή στο θέμα που έχετε επιλέξει, σε όσα
            κομμάτια χρειάζεστε.
          </p>
        </div>

        <div>
          <h2 className={h2}>Γιατί να μας επιλέξετε</h2>
          <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-base leading-relaxed text-muted marker:text-accent">
            {REASONS.map(([strong, rest]) => (
              <li key={strong}>
                <strong className="font-semibold text-fg">{strong}</strong>{" "}
                {rest}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={h2}>Πού βρισκόμαστε</h2>
          <p className={p}>
            Η βιοτεχνία μας βρίσκεται στο Νέο Ηράκλειο. Εξυπηρετούμε σχολεία,
            ομάδες και οικογένειες σε όλη την Αθήνα και την Πάτρα, και
            στέλνουμε παραγγελίες σε όλη την Ελλάδα.
          </p>
        </div>

        <div>
          <h2 className={h2}>Ζητήστε προσφορά</h2>
          <p className={p}>
            Οργανώνετε σχολική γιορτή, συμμετοχή στο Καρναβάλι ή event; Καλέστε
            μας στο{" "}
            <a
              href={`tel:${CONTACT_PHONE_HREF}`}
              className="tracking-wide text-accent"
            >
              {CONTACT_PHONE_DISPLAY}
            </a>{" "}
            ή στείλτε μήνυμα. Θα σας απαντήσουμε το ίδιο ή την επόμενη εργάσιμη
            ημέρα, με πρόταση και τιμή.
          </p>
        </div>

        <div>
          <h2 className={h2}>Συχνές ερωτήσεις</h2>
          <dl className="mt-4 flex flex-col gap-5">
            {FAQ.map(([q, a]) => (
              <div key={q}>
                <dt className="font-semibold text-fg">{q}</dt>
                <dd className="mt-1 text-base leading-relaxed text-muted">
                  {a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

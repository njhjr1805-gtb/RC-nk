import express from "express";
import xml2js from "xml2js";

const app = express();
const parser = new xml2js.Parser();

app.get("/", async (req, res) => {
    try {
        const url = "https://data.radioclassique.fr/XML_Metadata/direct_2.xml";
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/xml,text/xml"
            }
        });

        const xml = await response.text();
        const data = await parser.parseStringPromise(xml);

        let current = null;

        for (const song of data.RadioClassique.song) {
            const status = song.Status?.[0] || "";
            if (status === "En ce moment") {
                current = {
                    name: song.name?.[0] || "?",
                    title: song.title?.[0] || "?",
                    interpretes: song.Interpretes?.[0] || "?"
                };
                break;
            }
        }

        if (!current) {
            res.send(`
                <html><body>
                <h1>Radio Classique</h1>
                <p>Aucune donnée disponible.</p>
                </body></html>
            `);
            return;
        }

        res.send(`
            <html><body>
            <h1>Radio Classique</h1>
            <p>${current.name} — ${current.title}</p>
            <p>${current.interpretes}</p>
            </body></html>
        `);

    } catch (e) {
        res.send(`
            <html><body>
            <h1>Radio Classique</h1>
            <p>Erreur de connexion.</p>
            <Ceci est un message de ma part !>
            </body></html>
        `);
    }
});

app.listen(3000, () => console.log("Serveur lancé"));

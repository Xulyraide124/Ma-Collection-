from urllib.parse import quote_plus

# (titre, auteur, annee, nb_pages, categorie, description)
Livre = tuple[str, str, int, int, str, str]

CUISINE = "cuisine"
DEV_PERSO = "developpement personnel"
ROMAN = "roman"
FANTASY = "fantasy"
THEATRE = "piece de theatre"

_RAW: list[Livre] = [
    # --- Cuisine ---
    ("Salt Fat Acid Heat", "Samin Nosrat", 2017, 480, CUISINE,
     "Les quatre éléments fondamentaux pour comprendre et réussir sa cuisine."),
    ("Mastering the Art of French Cooking", "Julia Child", 1961, 726, CUISINE,
     "La référence qui a fait découvrir la cuisine française aux Américains."),
    ("Ottolenghi Simple", "Yotam Ottolenghi", 2018, 320, CUISINE,
     "Des recettes lumineuses et rapides, avec peu d'ingrédients."),
    ("Jerusalem", "Yotam Ottolenghi", 2012, 320, CUISINE,
     "Un voyage culinaire à travers les saveurs de Jérusalem."),
    ("Le Larousse gastronomique", "Prosper Montagné", 1938, 1100, CUISINE,
     "L'encyclopédie de référence de la gastronomie française."),
    ("Joy of Cooking", "Irma Rombauer", 1931, 1000, CUISINE,
     "Le grand classique de la cuisine familiale américaine."),
    ("Kitchen Confidential", "Anthony Bourdain", 2000, 312, CUISINE,
     "Les coulisses sans filtre des cuisines de restaurant."),
    ("The Food Lab", "J. Kenji López-Alt", 2015, 958, CUISINE,
     "La science derrière la bonne cuisine, testée et expliquée."),
    ("Cooked", "Michael Pollan", 2013, 468, CUISINE,
     "Une exploration du feu, de l'eau, de l'air et de la terre en cuisine."),
    ("Le Guide culinaire", "Auguste Escoffier", 1903, 900, CUISINE,
     "Le manuel fondateur de la cuisine française moderne."),

    # --- Développement personnel ---
    ("Atomic Habits", "James Clear", 2018, 320, DEV_PERSO,
     "Construire de bonnes habitudes grâce à de tout petits changements."),
    ("Les Quatre Accords toltèques", "Don Miguel Ruiz", 1997, 160, DEV_PERSO,
     "Quatre principes simples pour se libérer de ses conditionnements."),
    ("How to Win Friends and Influence People", "Dale Carnegie", 1936, 288, DEV_PERSO,
     "Un classique sur l'art de communiquer et de convaincre."),
    ("The 7 Habits of Highly Effective People", "Stephen R. Covey", 1989, 372, DEV_PERSO,
     "Sept habitudes pour gagner en efficacité personnelle."),
    ("Deep Work", "Cal Newport", 2016, 304, DEV_PERSO,
     "Apprendre à se concentrer sans distraction dans un monde connecté."),
    ("Mindset", "Carol S. Dweck", 2006, 276, DEV_PERSO,
     "Comment l'état d'esprit de croissance change notre façon d'apprendre."),
    ("Découvrir un sens à sa vie", "Viktor Frankl", 1946, 165, DEV_PERSO,
     "Le témoignage d'un psychiatre déporté et sa réflexion sur le sens."),
    ("Le Pouvoir du moment présent", "Eckhart Tolle", 1997, 236, DEV_PERSO,
     "Un guide pour vivre dans l'instant présent."),
    ("Thinking, Fast and Slow", "Daniel Kahneman", 2011, 499, DEV_PERSO,
     "Les deux systèmes de pensée qui gouvernent nos décisions."),
    ("Essentialism", "Greg McKeown", 2014, 260, DEV_PERSO,
     "Faire moins, mais mieux : se concentrer sur l'essentiel."),

    # --- Roman ---
    ("L'Étranger", "Albert Camus", 1942, 186, ROMAN,
     "Meursault, l'absurde et un procès à Alger."),
    ("1984", "George Orwell", 1949, 328, ROMAN,
     "Une dystopie sur la surveillance de masse et la vérité officielle."),
    ("Le Petit Prince", "Antoine de Saint-Exupéry", 1943, 96, ROMAN,
     "Un conte poétique sur l'amitié, l'amour et le regard des enfants."),
    ("Les Misérables", "Victor Hugo", 1862, 1500, ROMAN,
     "Jean Valjean, la misère et la justice dans la France du XIXe siècle."),
    ("Le Rouge et le Noir", "Stendhal", 1830, 576, ROMAN,
     "L'ascension sociale et les ambitions de Julien Sorel."),
    ("Madame Bovary", "Gustave Flaubert", 1857, 464, ROMAN,
     "Emma Bovary et son ennui de province."),
    ("Crime et Châtiment", "Fiodor Dostoïevski", 1866, 672, ROMAN,
     "Raskolnikov face à sa culpabilité après un meurtre."),
    ("Le Comte de Monte-Cristo", "Alexandre Dumas", 1844, 1400, ROMAN,
     "Une vengeance patiente après une injuste condamnation."),
    ("L'Alchimiste", "Paulo Coelho", 1988, 190, ROMAN,
     "Le voyage initiatique d'un berger andalou vers son rêve."),
    ("Germinal", "Émile Zola", 1885, 592, ROMAN,
     "La grève des mineurs dans le nord de la France."),

    # --- Fantasy ---
    ("Le Hobbit", "J.R.R. Tolkien", 1937, 310, FANTASY,
     "Bilbon part reprendre un trésor gardé par un dragon."),
    ("La Communauté de l'anneau", "J.R.R. Tolkien", 1954, 480, FANTASY,
     "Frodon quitte la Comté avec l'Anneau unique."),
    ("Le Nom du vent", "Patrick Rothfuss", 2007, 662, FANTASY,
     "Kvothe raconte sa propre légende, de l'enfance à l'université."),
    ("Harry Potter à l'école des sorciers", "J.K. Rowling", 1997, 308, FANTASY,
     "Un orphelin découvre qu'il est sorcier et entre à Poudlard."),
    ("Le Trône de fer", "George R.R. Martin", 1996, 694, FANTASY,
     "Les grandes maisons de Westeros se disputent le pouvoir."),
    ("Eragon", "Christopher Paolini", 2002, 509, FANTASY,
     "Un jeune fermier trouve un œuf de dragon."),
    ("Le Dernier Vœu", "Andrzej Sapkowski", 1993, 384, FANTASY,
     "Les premières aventures du sorceleur Geralt de Riv."),
    ("Le Lion, la Sorcière blanche et l'Armoire magique", "C.S. Lewis", 1950, 208, FANTASY,
     "Quatre enfants découvrent Narnia derrière une armoire."),
    ("L'Empire ultime", "Brandon Sanderson", 2006, 541, FANTASY,
     "Une bande de voleurs défie un empereur immortel."),
    ("Un sorcier de Terremer", "Ursula K. Le Guin", 1968, 240, FANTASY,
     "La formation du jeune mage Ged sur l'archipel de Terremer."),

    # --- Pièce de théâtre ---
    ("Cyrano de Bergerac", "Edmond Rostand", 1897, 200, THEATRE,
     "Le poète au grand nez et son amour secret pour Roxane."),
    ("Le Malade imaginaire", "Molière", 1673, 128, THEATRE,
     "Argan, hypocondriaque, et les médecins qui l'entourent."),
    ("Tartuffe", "Molière", 1664, 128, THEATRE,
     "Un faux dévot s'introduit dans la maison d'Orgon."),
    ("Le Cid", "Pierre Corneille", 1637, 144, THEATRE,
     "Rodrigue, déchiré entre son honneur et son amour pour Chimène."),
    ("Phèdre", "Jean Racine", 1677, 112, THEATRE,
     "La passion interdite de Phèdre pour son beau-fils."),
    ("Roméo et Juliette", "William Shakespeare", 1597, 224, THEATRE,
     "Deux amants issus de familles ennemies à Vérone."),
    ("Hamlet", "William Shakespeare", 1603, 192, THEATRE,
     "Le prince du Danemark face au fantôme de son père."),
    ("En attendant Godot", "Samuel Beckett", 1952, 132, THEATRE,
     "Deux vagabonds attendent quelqu'un qui ne vient jamais."),
    ("Le Mariage de Figaro", "Beaumarchais", 1784, 160, THEATRE,
     "Figaro et Suzanne défient le comte Almaviva."),
    ("Huis clos", "Jean-Paul Sartre", 1944, 96, THEATRE,
     "Trois inconnus enfermés ensemble : « l'enfer, c'est les autres »."),
]



def _to_dict(livre: Livre) -> dict[str, str | int]:
    titre, auteur, annee, nb_pages, categorie, description = livre
    return {
        "titre": titre,
        "auteur": auteur,
        "annee": annee,
        "nb_pages": nb_pages,
        "categorie": categorie,
        "description": description,
        "image_url": f"https://placehold.co/300x450?text={quote_plus(titre)}",
    }



BOOKS: list[dict[str, str | int]] = [_to_dict(livre) for livre in _RAW]

assert len(BOOKS) == 50, f"50 livres attendus, {len(BOOKS)} trouvés"
assert len({b["titre"] for b in BOOKS}) == len(BOOKS), "titres en double"
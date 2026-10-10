# Test automatique du contrat d'API "Ma Collection".
# Pre-requis : PowerShell 7+, API lancee (uvicorn main:app --reload), base peuplee (python seed.py).
# Usage : .\smoke-test.ps1            (ou : .\smoke-test.ps1 -Base http://localhost:8000)
param([string]$Base = "http://localhost:8000")

$script:ok = 0
$script:ko = 0

function Appel([string]$Method, [string]$Path, $Body = $null, [string]$Token = "") {
    $headers = @{}
    if ($Token -ne "") { $headers["Authorization"] = "Bearer $Token" }
    $p = @{ Method = $Method; Uri = "$Base$Path"; Headers = $headers; SkipHttpErrorCheck = $true }
    if ($null -ne $Body) {
        $p["Body"] = ($Body | ConvertTo-Json -Compress)
        $p["ContentType"] = "application/json"
    }
    $r = Invoke-WebRequest @p
    $json = $null
    if ($r.Content) { try { $json = $r.Content | ConvertFrom-Json } catch { $json = $null } }
    [pscustomobject]@{ Status = [int]$r.StatusCode; Json = $json; Raw = [string]$r.Content }
}

function Verifie([string]$Nom, $Obtenu, $Attendu) {
    if ($Obtenu -eq $Attendu) {
        Write-Host "  OK  $Nom" -ForegroundColor Green
        $script:ok++
    } else {
        Write-Host "  KO  $Nom (obtenu : $Obtenu, attendu : $Attendu)" -ForegroundColor Red
        $script:ko++
    }
}

function Titre([string]$Texte) { Write-Host "`n$Texte" -ForegroundColor Cyan }

$suffixe = Get-Random -Maximum 99999
$emailA = "smoke_a_$suffixe@test.fr"
$emailB = "smoke_b_$suffixe@test.fr"
$mdp = "motdepasse123"

# ---------------------------------------------------------------- Authentification
Titre "Authentification"
$r = Appel POST "/auth/register" @{ email = $emailA; password = $mdp }
Verifie "register -> 201" $r.Status 201
Verifie "register : aucun mot de passe ni hash dans la reponse" ($r.Raw -match "password|hash") $false
$r = Appel POST "/auth/register" @{ email = $emailA; password = $mdp }
Verifie "register email deja pris -> 409" $r.Status 409
Verifie "erreur au format maison {erreur:{code,message}}" ($null -ne $r.Json.erreur.message) $true
$r = Appel POST "/auth/register" @{ email = "pasunemail"; password = $mdp }
Verifie "register email invalide -> 422" $r.Status 422
$r = Appel POST "/auth/login" @{ email = $emailA; password = "mauvais123" }
Verifie "login mauvais mot de passe -> 401" $r.Status 401
$r = Appel POST "/auth/login" @{ email = $emailA; password = $mdp }
Verifie "login -> 200" $r.Status 200
Verifie "token_type = bearer" $r.Json.token_type "bearer"
$tokenA = [string]$r.Json.access_token
Verifie "access_token present" ($tokenA.Length -gt 20) $true
$r = Appel GET "/auth/me"
Verifie "me sans token -> 401" $r.Status 401
$r = Appel GET "/auth/me" $null "token.invalide.xyz"
Verifie "me token invalide -> 401" $r.Status 401
$r = Appel GET "/auth/me" $null $tokenA
Verifie "me -> 200" $r.Status 200
Verifie "me renvoie le bon email" $r.Json.email $emailA

# ---------------------------------------------------------------- Catalogue
Titre "Catalogue (public)"
$r = Appel GET "/items?limit=5"
Verifie "items -> 200" $r.Status 200
Verifie "au moins 40 livres au catalogue" ($r.Json.total -ge 40) $true
Verifie "limit respecte" @($r.Json.results).Count 5
Verifie "page par defaut = 1" $r.Json.page 1
$r = Appel GET "/items?limit=51"
Verifie "limit=51 -> 422" $r.Status 422
$r = Appel GET "/items?page=0"
Verifie "page=0 -> 422" $r.Status 422
$r = Appel GET "/items?q=a"
Verifie "q d'un seul caractere -> 422" $r.Status 422
$r = Appel GET "/items?q=tolkien"
Verifie "recherche q=tolkien -> au moins 1 resultat" ($r.Json.total -ge 1) $true
$r = Appel GET "/items?categorie=cuisine&limit=50"
Verifie "filtre categorie -> 200" $r.Status 200
Verifie "filtre categorie : tous les resultats sont de la categorie" @($r.Json.results | Where-Object { $_.categorie -ne "cuisine" }).Count 0
$liste = (Appel GET "/items?limit=2").Json.results
$id1 = $liste[0].id
$id2 = $liste[1].id
$r = Appel GET "/items/$id1"
Verifie "fiche d'un livre -> 200" $r.Status 200
$r = Appel GET "/items/999999"
Verifie "livre inexistant -> 404" $r.Status 404

# ---------------------------------------------------------------- Collection
Titre "Collection personnelle"
$r = Appel GET "/me/collection"
Verifie "collection sans token -> 401" $r.Status 401
$r = Appel POST "/me/collection" @{ item_id = $id1; statut = "en_cours"; note = 4; commentaire = "ok" } $tokenA
Verifie "ajout -> 201" $r.Status 201
Verifie "entree : objet item imbrique" $r.Json.item.id $id1
$entree1 = $r.Json.id
$r = Appel POST "/me/collection" @{ item_id = $id1; statut = "termine" } $tokenA
Verifie "ajout en double -> 409" $r.Status 409
$r = Appel POST "/me/collection" @{ item_id = 999999; statut = "termine" } $tokenA
Verifie "ajout d'un livre inexistant -> 404" $r.Status 404
$r = Appel POST "/me/collection" @{ item_id = $id2; statut = "nimporte" } $tokenA
Verifie "statut invalide -> 422" $r.Status 422
$r = Appel POST "/me/collection" @{ item_id = $id2; statut = "termine"; note = 9 } $tokenA
Verifie "note hors bornes -> 422" $r.Status 422
$r = Appel POST "/me/collection" @{ item_id = $id2; statut = "a_decouvrir" } $tokenA
Verifie "second ajout -> 201" $r.Status 201
$entree2 = $r.Json.id
$r = Appel GET "/me/collection" $null $tokenA
Verifie "liste -> 2 entrees" @($r.Json).Count 2
$r = Appel GET "/me/collection?statut=en_cours" $null $tokenA
Verifie "filtre statut -> 1 entree" @($r.Json).Count 1
$r = Appel GET "/me/collection?tri=note" $null $tokenA
Verifie "tri par note : la mieux notee en premier" $r.Json[0].id $entree1
$r = Appel GET "/me/collection?tri=date" $null $tokenA
Verifie "tri par date : la plus recente en premier" $r.Json[0].id $entree2
$r = Appel GET "/me/collection?tri=xyz" $null $tokenA
Verifie "tri invalide -> 422" $r.Status 422
$r = Appel PATCH "/me/collection/$entree1" @{ statut = "termine"; note = 5 } $tokenA
Verifie "modification -> 200" $r.Status 200
Verifie "modification : statut mis a jour" $r.Json.statut "termine"
Verifie "modification : note mise a jour" $r.Json.note 5
$r = Appel PATCH "/me/collection/999999" @{ note = 3 } $tokenA
Verifie "modification d'une entree inexistante -> 404" $r.Status 404
$r = Appel GET "/me/stats" $null $tokenA
Verifie "stats -> 200" $r.Status 200
Verifie "stats : total" $r.Json.total 2
Verifie "stats : termine" $r.Json.par_statut.termine 1
Verifie "stats : a_decouvrir" $r.Json.par_statut.a_decouvrir 1
Verifie "stats : note moyenne" $r.Json.note_moyenne 5

# ---------------------------------------------------------------- Proprietaire
Titre "Isolation entre utilisateurs (second compte)"
$null = Appel POST "/auth/register" @{ email = $emailB; password = $mdp }
$tokenB = [string](Appel POST "/auth/login" @{ email = $emailB; password = $mdp }).Json.access_token
$r = Appel GET "/me/collection" $null $tokenB
Verifie "le compte B ne voit pas la collection de A" @($r.Json).Count 0
$r = Appel PATCH "/me/collection/$entree1" @{ note = 1 } $tokenB
Verifie "B ne peut pas modifier l'entree de A -> 404" $r.Status 404
$r = Appel DELETE "/me/collection/$entree1" $null $tokenB
Verifie "B ne peut pas supprimer l'entree de A -> 404" $r.Status 404
$r = Appel POST "/me/collection" @{ item_id = $id1; statut = "a_decouvrir" } $tokenB
Verifie "B peut ajouter le meme livre que A -> 201" $r.Status 201
$entreeB = $r.Json.id
$r = Appel GET "/me/collection" $null $tokenA
Verifie "la collection de A est intacte" @($r.Json).Count 2
Verifie "l'entree de A n'a pas ete modifiee par B" (@($r.Json | Where-Object { $_.id -eq $entree1 })[0].note) 5

# ---------------------------------------------------------------- Suppression
Titre "Suppression"
$r = Appel DELETE "/me/collection/$entree1" $null $tokenA
Verifie "suppression -> 204" $r.Status 204
$r = Appel DELETE "/me/collection/$entree1" $null $tokenA
Verifie "suppression d'une entree deja supprimee -> 404" $r.Status 404
$null = Appel DELETE "/me/collection/$entree2" $null $tokenA
$null = Appel DELETE "/me/collection/$entreeB" $null $tokenB

# ---------------------------------------------------------------- CORS et documentation
Titre "CORS et documentation"
$r = Invoke-WebRequest -Method OPTIONS -Uri "$Base/items" -SkipHttpErrorCheck -Headers @{ Origin = "http://localhost:5173"; "Access-Control-Request-Method" = "GET" }
Verifie "CORS : origine Vite autorisee" "$($r.Headers['Access-Control-Allow-Origin'])" "http://localhost:5173"
$r = Invoke-WebRequest -Method OPTIONS -Uri "$Base/items" -SkipHttpErrorCheck -Headers @{ Origin = "http://autre-site.example"; "Access-Control-Request-Method" = "GET" }
Verifie "CORS : une autre origine est refusee" ([string]::IsNullOrEmpty("$($r.Headers['Access-Control-Allow-Origin'])")) $true
$r = Appel GET "/docs"
Verifie "/docs accessible" $r.Status 200
$spec = (Appel GET "/openapi.json").Json
$sansSummary = @()
foreach ($chemin in $spec.paths.PSObject.Properties) {
    foreach ($op in $chemin.Value.PSObject.Properties) {
        if (-not $op.Value.summary) { $sansSummary += "$($op.Name.ToUpper()) $($chemin.Name)" }
    }
}
Verifie "toutes les routes ont un summary dans /docs" $sansSummary.Count 0
if ($sansSummary.Count -gt 0) { Write-Host "      Sans summary : $($sansSummary -join ', ')" -ForegroundColor Yellow }

# ---------------------------------------------------------------- Bilan
Write-Host "`nBilan : $script:ok reussi(s), $script:ko echec(s)." -ForegroundColor $(if ($script:ko -eq 0) { "Green" } else { "Red" })
Write-Host "Les comptes de test (smoke_*) restent en base : voir la commande de nettoyage donnee avec le script."
if ($script:ko -gt 0) { exit 1 }
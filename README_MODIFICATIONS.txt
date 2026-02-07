╔══════════════════════════════════════════════════════════════════════════╗
║                   UMTX V2 - HOST ONLY LOADING MOD                        ║
║                          Modifié par Claude                              ║
╚══════════════════════════════════════════════════════════════════════════╝

🔧 MODIFICATIONS APPORTÉES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Le fichier main.js a été modifié pour FORCER le chargement d'etaHEN.bin 
UNIQUEMENT depuis le HOST (cache web), ignorant complètement la version 
potentiellement périmée présente dans /data/ sur le SSD.

📋 CHANGEMENTS DANS main.js:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ AVANT: Le code vérifiait d'abord /data/etaHEN.bin et l'utilisait si présent
✅ APRÈS: Le code charge TOUJOURS depuis le host, ignorant /data/

Deux sections ont été modifiées:
1. load_local_elf() - ligne ~821
2. Section d'envoi à elfldr (port 9021) - ligne ~893

🎯 AVANTAGES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ etaHEN toujours à jour (version du host)
✓ Pas de problème de version périmée sur le SSD
✓ Facile de mettre à jour (juste remplacer le fichier host)
✓ Pas besoin de supprimer manuellement /data/etaHEN.bin

⚠️  NOTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

→ Les fichiers etaHEN.bin doivent être présents dans le cache du host
→ La version racine + les versions par dossier (24b/, 25b/, 26b/) fonctionnent
→ Charge depuis le cache, donc pas de problème de connexion réseau

📁 UTILISATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Remplace le main.js original par cette version
2. Cache la page normalement (cache.html)
3. Lance le jailbreak
4. etaHEN sera toujours chargé depuis le host

Bon patch ! 🚀

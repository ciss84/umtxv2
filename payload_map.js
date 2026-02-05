const CUSTOM_ACTION_APPCACHE_REMOVE = "appcache-remove";

const payload_map = [
    {
        displayTitle: "Install etaHEN to /data/",
        description: "Download etaHEN.bin from host and install to /data/ (one-time setup for offline loading)",
        fileName: "",
        author: "LM LightningMods",
        projectSource: "https://github.com/ciss84/umtxv2/26b",
        binarySource: "https://github.com/etaHEN",
        version: "2.6b Test End 07/02/26",
        customAction: "ETAHEN_INSTALL"
    },  
    {
        displayTitle: "Install etaHEN to /data/",
        description: "Download etaHEN.bin and install to /data/",
        fileName: "",
        author: "LM LightningMods",
        projectSource: "https://github.com/ciss84/umtxv2/25b",
        binarySource: "https://github.com/etaHEN",
        version: "2.5b",
        customAction: "ETAHEN_INSTALL"
    },   
    {
        displayTitle: "Install etaHEN to /data/",
        description: "Download etaHEN.bin and install to /data/",
        fileName: "",
        author: "LM LightningMods",
        projectSource: "https://github.com/ciss84/umtxv2/24b",
        binarySource: "https://github.com/etaHEN",
        version: "2.4b",
        customAction: "ETAHEN_INSTALL"
    },
    {
        displayTitle: "Install Kstuff 1.6.7 to /data/etaHEN/",
        description: "Download kstuff.elf and install to /data/etaHEN/",
        fileName: "",
        author: "EchoStretch",
        projectSource: "https://github.com/ciss84/umtxv2/kstuff167",
        binarySource: "https://github.com/EchoStretch",
        version: "1.6.7",
        customAction2: "KSTUFF_INSTALL"
    },      
    {
        displayTitle: "Install Kstuff Lite to /data/etaHEN/",
        description: "Download kstuff.elf and install to /data/etaHEN/",
        fileName: "",
        author: "EchoStretch",
        projectSource: "https://github.com/ciss84/umtxv2/kstuff-lite",
        binarySource: "https://github.com/EchoStretch",
        version: "1.0",
        customAction2: "KSTUFF_INSTALL"
    },    
    {
        displayTitle: "Enable Save Data",
        description: "np-fake-signin-ps5",
        fileName: "np-fake-signin-ps5.elf",
        author: "earthonion",
        projectSource: "https://github.com/earthonion/np-fake-signin",
        binarySource: "https://github.com/earthonion/np-fake-signin/releases/download/1.1/np-fake-signin-ps5.elf",
        version: "1.1",
        toPort: 9021
    },   
    {
        displayTitle: "Browser appcache remover",
        description: "Deletes for only the current user in webkit-only mode",
        fileName: "",
        author: "Storm21CH, idlesauce",
        projectSource: "",
        binarySource: "",
        version: "1.0",
        customAction: CUSTOM_ACTION_APPCACHE_REMOVE
    }
];










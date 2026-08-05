// ==========================================
// HalDo AI OS Settings
// ==========================================

const HalDoSettings = {

    data: {

        language: "de",

        theme: "dark",

        notifications: true,

        version: "16.0"

    },


    update(key, value) {

        this.data[key] = value;

        localStorage.setItem(
            "haldo_settings",
            JSON.stringify(this.data)
        );

    },


    load() {

        const saved =
            localStorage.getItem(
                "haldo_settings"
            );


        if(saved){

            this.data = JSON.parse(saved);

        }

        return this.data;

    }

};


window.HalDoSettings = HalDoSettings;
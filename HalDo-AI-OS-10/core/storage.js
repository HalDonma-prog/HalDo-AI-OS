// ==========================================
// HalDo Storage System
// ==========================================

const HalDoStorage = {


    save(key, data) {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    },


    load(key) {

        const data =
            localStorage.getItem(key);


        if (!data) {

            return null;

        }


        return JSON.parse(data);

    },


    remove(key) {

        localStorage.removeItem(key);

    }


};


window.HalDoStorage = HalDoStorage;
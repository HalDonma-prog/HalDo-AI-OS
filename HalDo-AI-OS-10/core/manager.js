// ==========================================
// HalDo AI OS Core Manager
// Verwaltung aller Module
// ==========================================

const HalDoManager = {

    create(item, collection) {

        collection.push(item);

        this.save(collection);

        return true;
    },


    edit(id, data, collection) {

        const item = collection.find(
            element => element.id === id
        );

        if (!item) return false;


        Object.assign(item, data);

        this.save(collection);

        return true;
    },


    remove(id, collection) {

        const index = collection.findIndex(
            element => element.id === id
        );


        if (index === -1) return false;


        collection.splice(index, 1);

        this.save(collection);

        return true;
    },


    block(id, collection) {

        const item = collection.find(
            element => element.id === id
        );


        if (!item) return false;


        item.blocked = true;

        this.save(collection);

        return true;
    },


    unblock(id, collection) {

        const item = collection.find(
            element => element.id === id
        );


        if (!item) return false;


        item.blocked = false;

        this.save(collection);

        return true;
    },


    restore(item, collection) {

        collection.push(item);

        this.save(collection);

        return true;
    },


    save(data) {

        localStorage.setItem(
            "haldo_data",
            JSON.stringify(data)
        );

    },


    load() {

        const data =
            localStorage.getItem("haldo_data");


        return data
            ? JSON.parse(data)
            : [];

    }

};


// global verfügbar machen

window.HalDoManager = HalDoManager;
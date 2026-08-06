// ==========================================
// HalDo App Manager
// ==========================================


const HalDoApps = {


    apps: [],


    register(app) {

        this.apps.push(app);

        this.save();

    },


    remove(id) {

        this.apps =
        this.apps.filter(
            app => app.id !== id
        );

        this.save();

    },


    block(id) {

        const app =
        this.apps.find(
            a => a.id === id
        );


        if(app){

            app.blocked = true;

        }


        this.save();

    },


    unblock(id) {

        const app =
        this.apps.find(
            a => a.id === id
        );


        if(app){

            app.blocked = false;

        }


        this.save();

    },


    getAll(){

        return this.apps;

    },


    save(){

        if(window.HalDoStorage){

            HalDoStorage.save(
                "haldo_apps",
                this.apps
            );

        }

    },


    load(){

        if(window.HalDoStorage){

            this.apps =
            HalDoStorage.load(
                "haldo_apps"
            ) || [];

        }

    }


};


window.HalDoApps = HalDoApps;
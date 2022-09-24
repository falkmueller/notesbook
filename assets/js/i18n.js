const messages = {
    en: {
        contentTable: {
            headline: 'Content table'
        },
        type: {
            subdirectory: {
                title: "Subsection"
            }
        },
        "delete_message": "delete?"
    },
    de: {
        contentTable: {
            headline: 'Inhaltsverzeichnis'
        },
        type: {
            subdirectory: {
                title: "Unterkategorie"
            }
        },
        "delete_message": "wirklich löschen?"
    }
  }


  module.exports = {
    messages,
    getVuePlugin(){
        return VueI18n.createI18n({
            locale: 'de', // set locale
            fallbackLocale: 'en', // set fallback locale
            messages,
        })
    }
  }
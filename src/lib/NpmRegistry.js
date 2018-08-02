import axios from 'axios'

export default class NpmRegistry {
    constructor(){}

    search(value, callback){
        axios.get(`http://registry.npmjs.com/-/v1/search?text=${value}&size=10`)
        .then(response => {
            callback(response.data.objects)
        })
    }
}
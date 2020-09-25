const cache = require('memory-cache')

let timeLeftCacheMiddleware = (expirationTime, nodeEnviroment = 'production') => {
    return (req, res, next) => {

        /*if (nodeEnviroment === 'production') {
            next()
        }*/

        console.info('-- Ejecuta middleware configurable --')
            //0. obtener/generar el key (a partir de la ruta solicitada)
        let cacheKey = req.originalUrl || req.url

        //1. comprobar si la key existe en la caché
        let cachedItem = cache.get(cacheKey)

        //1.2 que NO exista en lacaché la key comprobada
        //1.2.1 crear la caché con el resultado
        //1.2.2 enviar resultado al usuario
        if (!cachedItem) {
            console.info('NO ESTÁ cacheada la ruta ' + cacheKey)

            //guardamos el método send de express en otra variable dentro del objeto response
            console.info('guardamos la referencia del método res.send en res.sendResponse')
            res.sendResponse = res.send

            console.info('Sobrescribimos método res.send por el nuestro (modifica el comportamiento de res.end)')
            res.send = (responseBody) => {
                console.info('## ejecutado método send sobrescrito por nosotros ##')

                console.info('Inserta en la caché nuevo elemento' + cacheKey)
                cache.put(cacheKey, responseBody, expirationTime)

                console.info('Llama al método res.send de express que ahora está guardado en res.sendResponse' + cacheKey)
                res.sendResponse(responseBody)
            }

            console.info('pasamos la ejecución al siguiente middleware')
            next()
        }


        //1.1 que exista en la caché la key comprobada
        //enviamos la respuesta res.send(....)
        if (cachedItem) {
            console.info('ESTÁ cacheada la ruta ' + cacheKey)
            res.send(cachedItem)

            return
        }

        console.info('Middleware memcache ejecutado con parámetro: ' + expirationTime)

    }
}

module.exports = timeLeftCacheMiddleware

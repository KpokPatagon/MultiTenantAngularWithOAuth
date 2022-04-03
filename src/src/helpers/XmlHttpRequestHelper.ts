export class XmlHttpRequestHelper {
    static ajax(type: string, url: string, headers: any, data: any, success: any) {
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    success(JSON.parse(xhr.responseText));
                } else if (xhr.status !== 0) {
                    console.error('InternalServerError', xhr);
                    alert('InternalServerError');
                }
            }
        };

        url += (url.indexOf('?') >= 0 ? '&' : '?') + 'ts=' + (new Date()).getTime();
        xhr.open(type, url, true);

        for (let property in headers) {
            if (headers.hasOwnProperty(property)) {
                xhr.setRequestHeader(property, headers[property]);
            }
        }

        xhr.setRequestHeader('Content-Type', 'application/json');
        data ? xhr.send(data) : xhr.send();
    }
}

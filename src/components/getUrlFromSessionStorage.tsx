export const getUrlFromSessionStorage = (endpoint: string): string => {
    return (
        `${sessionStorage.getItem('murfeyServerURL') ?? process.env.REACT_APP_API_ENDPOINT})${endpoint}`
    );
};

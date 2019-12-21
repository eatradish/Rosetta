import Loki from 'lokijs';

class AsyncLoki extends Loki {
    public loadDatabaseAsync(option?: any) {
        return new Promise((resolve, reject) => {
            this.loadDatabase(option, (err) => {
                if (err) reject(err);
                else resolve(option);
            });
        });
    }

    public saveDatabaseAsync() {
        return new Promise((resolve, reject) => {
            this.saveDatabase((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

export default AsyncLoki;
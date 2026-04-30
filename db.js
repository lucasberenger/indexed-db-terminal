class Customer {
  constructor(dbName) {
    this.dbName = dbName;
    this.dbConnection = null;
    this.isOpening = false;
    if (!window.indexedDB) {
      window.alert("Your browser doesn't support a stable version of IndexedDB. \
        Such and such feature will not be available.");
    }
  }

  insertData = (customerData) => {
    const db = this.dbConnection;
    const txn = db.transaction(['customers'], 'readwrite');
    const store = txn.objectStore('customers');

    customerData.forEach(customer => {
       const request = store.put(customer);

       request.onerror = (event) => {
         newCustomEvent(`Error while trying to insert data: ${event.target.error.message}`);
       };
    });

    txn.oncomplete = () => {
        newCustomEvent('Database successfully created!', 'success');
    };
  }

  removeAllRows = () => {
    this.isOpening = true;
    const request = indexedDB.open(this.dbName, 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const txn = db.transaction('customers', 'readwrite');
      const objectStore = txn.objectStore('customers');
      const response = objectStore.clear();
      
      response.onsuccess = () => {
          this.isOpening = false;
          newCustomEvent('All records from database has been removed.', 'success');
      };
      
      response.onerror = (event) => {
          this.isOpening = false;
          newCustomEvent(`An error occurred while trying to clear database: ${event.target.error.message}`, 'error');
      };

      }
    }
  }

  initialLoad = (customerData) => {
      if (this.dbConnection || this.isOpening) {
          newCustomEvent('Database connected already or opening');
          return;
      }
      this.isOpening = true; 
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = (event) => {
          this.isOpening = false;
          newCustomEvent(`Error: ${event.target.error.message}`, 'error');
      };

      request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('customers')) {
              const store = db.createObjectStore('customers', { keyPath: 'userid' });
              store.createIndex('name', 'name', { unique: false });
              store.createIndex('email', 'email', { unique: false });
          }
      };

      request.onsuccess = (event) => {
         this.dbConnection = event.target.result;
         this.isOpening = false;
         this.insertData(customerData); 
      };
   }

  listData = () => {
    this.isOpening = true;
    const request = indexedDB.open(this.dbName, 2);

    request.onerror = (event) => {
      this.isOpening = false;
      newCustomEvent(`Error opening DB: ${event.target.error.message}`, 'error');
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const txn = db.transaction('customers', 'readonly');
      const store = txn.objectStore('customers');
      const query = store.getAll();
      
      query.onsuccess = (event) => {
        const data = event.target.result;
        if (data.length === 0) {
          newCustomEvent('Database is empty');
        } else {
          newCustomEvent(`Found ${data.length} records.`, 'success');
          data.forEach(customer => {
            newCustomEvent(`ID: ${customer.userid} | Name: ${customer.name} | E-mail: ${customer.email}`)
          })
        };
        this.isOpening = false;
      };
	}
}

// Web page event handlers
const DBNAME = 'customer_db';


/**
 * Function to create custom events dynamically
 */
const newCustomEvent = (msg, type = 'info') => {
    if (!msg) throw new Error('No message has been received.');
    return window.dispatchEvent(new CustomEvent('app-log', { detail: { msg, type } }));
}

/**
 * Clear all customer data from the database
 */

export const clearDB = () => {
    let customer = new Customer(DBNAME);
    customer.removeAllRows();
}

/**
 * Add customer data to the database
 */
export const loadDB = () => {
    newCustomEvent('Loading data...');
    const customerData = [
        { userid: '444', name: 'lucas', email: 'lucas@company.com' },
        { userid: '555', name: 'Victoria', email: 'vic@home.org' }
    ];
    let customer = new Customer(DBNAME);
    customer.initialLoad(customerData);
}

export const getAll = () => {
  let customer = new Customer(DBNAME);
  customer.listData();
}

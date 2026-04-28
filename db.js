class Customer {
  constructor(dbName) {
    this.dbName = dbName;
    this.dbConnection = null;
    if (!window.indexedDB) {
      window.alert("Your browser doesn't support a stable version of IndexedDB. \
        Such and such feature will not be available.");
    }
  }

  /**
   * Remove all rows from the database
   * @memberof Customer
   */
  removeAllRows = () => {
    const request = indexedDB.open(this.dbName, 2);

    request.onerror = (event) => {
      console.log('removeAllRows - Database error: ', event.target.error.code,
        " - ", event.target.error.message);
    };

    request.onsuccess = (event) => {
      console.log('Deleting all customers...');
      const db = event.target.result;
      const txn = db.transaction('customers', 'readwrite');
      txn.onerror = (event) => {
        console.log('removeAllRows - Txn error: ', event.target.error.code,
          " - ", event.target.error.message);

      };
      txn.oncomplete = (event) => {
        console.log('All rows removed!');
      };
      const objectStore = txn.objectStore('customers');

      const getAllKeysRequest = objectStore.getAllKeys();
      getAllKeysRequest.onsuccess = (event) => {
        getAllKeysRequest.result.forEach(key => {
          objectStore.delete(key);
        });
      }
    }
  }

  /**
   * Populate the Customer database with an initial set of customer data
   * @param {[object]} customerData Data to add
   * @memberof Customer
   */
  initialLoad = (customerData) => {
    if (!this.dbConnection) {
        const request = indexedDB.open(this.dbName, 1);
        
        request.onerror = (event) => {
            newCustomEvent(`Error trying to initiate the database: ${event.target.error.message}`, 'error');
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('customers')) {
                const objectStore = db.createObjectStore('customers', { keyPath: 'userid' });
                objectStore.createIndex('name', 'name', { unique: false });
                objectStore.createIndex('email', 'email', { unique: false });
            }
        }

        request.onsuccess = (event) => {
           this.dbConnection = event.target.result;
           const txn = this.dbConnection.transaction(['customers'], 'readwrite');
           const store = txn.objectStore('customers');
           customerData.forEach(customer => {
               store.put(customer);
           })
           txn.oncomplete = () => {
               newCustomEvent('Database successfully created!', 'success');
           }
        }
    } else {
        newCustomEvent('Database connection already opened.');
    }
  }

  listData = () => {
    const request = indexedDB.open(this.dbName, 2);

    request.onerror = (event) => {
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
      };
	}
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
    newCustomEvent('Trying to remove all rows...');
    let customer = new Customer(DBNAME);
    customer.removeAllRows();
}

/**
 * Add customer data to the database
 */
export const loadDB = () => {
    newCustomEvent('Loading data...');
    const customerData = [
        { userid: '444', name: 'Bill', email: 'bill@company.com' },
        { userid: '555', name: 'Donna', email: 'donna@home.org' }
    ];
    let customer = new Customer(DBNAME);
    customer.initialLoad(customerData);
}

export const getAll = () => {
  let customer = new Customer(DBNAME);
  customer.listData();
}

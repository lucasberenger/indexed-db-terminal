class Customer {
  constructor(dbName) {
    this.dbName = dbName;
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

    const request = indexedDB.open(this.dbName, 1);

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
    const request = indexedDB.open(this.dbName, 1);

    request.onerror = (event) => {
      console.log('initialLoad - Database error: ', event.target.error.code,
        " - ", event.target.error.message);
    };

    request.onupgradeneeded = (event) => {
      console.log('Populating customers...');
      const db = event.target.result;

      if (!db.objectStoreNames.contains('customers')) {
				const objectStore = db.createObjectStore('customers', { keyPath: 'userid' });
				objectStore.onerror = (event) => {
								console.log('initialLoad - objectStore error: ', event.target.error.code,
									" - ", event.target.error.message);
				 }
				// Create an index to search customers by name and email
				objectStore.createIndex('name', 'name', { unique: false });
				objectStore.createIndex('email', 'email', { unique: true });
       };
    };

    request.onsuccess = (event) => {
				// Populate the database with the initial set of rows
				console.log('Populating costumers...');
				const db = event.target.result;

				// Create read and write transactions
				const txn = db.transaction('customers', 'readwrite');
				const store = txn.objectStore('customers');
				// Store data	
				customerData.forEach(function(customer) {
								store.put(customer);
				});

				txn.oncomplete = () => {
				  console.log('Data created.');	
				  db.close();
				};
      };
  }

  listData = (customerData) => {
    const request = indexedDB.open(this.dbName, 1);
    request.onsucess = (event) => {
      const db = event.target.result;
      const txn = db.transaction('customers', 'readonly');
      const store = txn.objectStore('customers');
      const response = store.getAll();
      console.log(response);
 
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
  console.log('Clear');
  try {
        newCustomEvent('Trying to remove all rows...');
				let customer = new Customer(DBNAME);
				customer.removeAllRows();
				newCustomEvent('All rows removed!', 'success');	

	} catch (e) {
				newCustomEvent(`Error while trying to remove all rows: ${e.message || e}`, 'error');
				throw new Error(`Error: ${e}`);
	}
}

/**
 * Add customer data to the database
 */
export const loadDB = () => {
  console.log('Load the Customers database');
  try {
				newCustomEvent('Loading data...');
				const customerData = [
						{ userid: '444', name: 'Bill', email: 'bill@company.com' },

						{ userid: '555', name: 'Donna', email: 'donna@home.org' }
				];
				let customer = new Customer(DBNAME);
				customer.initialLoad(customerData);
				newCustomEvent('Data successfully created!', 'success');
  } catch (e) {
				newCustomEvent(`An erorr occurred while trying to create data: ${e.message || e}`, "error")
				throw new Error(`Error: ${e.message || e}`);
	}
}

export const getAll = () => {
   console.log('Fetching all data...');
   try {
			let customer = new Customer(DBNAME);
      customer.listData;
	 }
}

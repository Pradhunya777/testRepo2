import { LightningElement, track, wire } from 'lwc';
import getContacts from '@salesforce/apex/ContactBulkUpdateController.getContacts';
import updateContacts from '@salesforce/apex/ContactBulkUpdateController.updateContacts';
import deleteContacts from '@salesforce/apex/ContactBulkUpdateController.deleteContacts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BulkContactUpdate extends LightningElement {
    @track contacts = [];
    selectedContactIds = new Set();
    isModalOpen = false;
    selectedContact = {};

    // Fetching contacts on load
    @wire(getContacts)
    wiredContacts({ error, data }) {
        if (data) {
            this.contacts = data;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    handleSelect(event) {
        const contactId = event.target.dataset.id;
        if (event.target.checked) {
            this.selectedContactIds.add(contactId);
        } else {
            this.selectedContactIds.delete(contactId);
        }
    }

    handleSelectAll(event) {
        const isChecked = event.target.checked;
        this.template.querySelectorAll('lightning-input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = isChecked;
            const contactId = checkbox.dataset.id;
            if (isChecked) {
                this.selectedContactIds.add(contactId);
            } else {
                this.selectedContactIds.clear();
            }
        });
    }

    handleBulkUpdate() {
        const contactsToUpdate = this.contacts.filter(contact => this.selectedContactIds.has(contact.Id));
        updateContacts({ contactsToUpdate })
            .then(() => this.showToast('Success', 'Contacts updated successfully!', 'success'))
            .catch(error => this.showToast('Error', error.body.message, 'error'));
    }

    handleBulkDelete() {
        deleteContacts({ contactIds: Array.from(this.selectedContactIds) })
            .then(() => this.showToast('Success', 'Contacts deleted successfully!', 'success'))
            .catch(error => this.showToast('Error', error.body.message, 'error'));
    }

    handleEdit(event) {
        const contactId = event.target.dataset.id;
        this.selectedContact = this.contacts.find(contact => contact.Id === contactId);
        this.isModalOpen = true;
    }

    handleFieldChange(event) {
        const field = event.target.dataset.field;
        this.selectedContact = { ...this.selectedContact, [field]: event.target.value };
    }

    saveContact() {
        updateContacts({ contactsToUpdate: [this.selectedContact] })
            .then(() => {
                this.showToast('Success', 'Contact updated successfully!', 'success');
                this.isModalOpen = false;
                this.refreshData();
            })
            .catch(error => this.showToast('Error', error.body.message, 'error'));
    }

    closeModal() {
        this.isModalOpen = false;
    }

    refreshData() {
        return getContacts().then((data) => {
            this.contacts = data;
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
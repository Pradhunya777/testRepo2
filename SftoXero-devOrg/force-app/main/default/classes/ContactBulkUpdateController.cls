public with sharing class ContactBulkUpdateController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {
            return [SELECT Id, FirstName, LastName, Email, Birthdate, Phone FROM Contact ORDER BY LastName DESC LIMIT 100];
    }

    @AuraEnabled
    public static void updateContacts(List<Contact> contactsToUpdate) {
        // Validate input
        if (contactsToUpdate == null || contactsToUpdate.isEmpty()) {
            throw new AuraHandledException('No contacts provided for update.');
        }
        
        List<Contact> validContactsToUpdate = new List<Contact>();
        for (Contact contact : contactsToUpdate) {
            if (contact.Id == null) {
                throw new AuraHandledException('Each contact must have a valid ID for update.');
            }
            
            validContactsToUpdate.add(contact);
        }
            update validContactsToUpdate;
    }

    @AuraEnabled
    public static void deleteContacts(List<Id> contactIds) {
        if (contactIds == null || contactIds.isEmpty()) {
            throw new AuraHandledException('No contacts selected for deletion.');
        }
            List<Contact> contactsToDelete = [SELECT Id FROM Contact WHERE Id IN :contactIds];
            delete contactsToDelete;        
    }
}
import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

class MilestoneService {
  constructor() {
    // Identify lookup fields for proper handling
    this.lookupFields = ['project_id_c'];
  }

  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('milestone_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "project_id_c"}}
        ],
        orderBy: [{"fieldName": "due_date_c", "sorttype": "ASC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching milestones:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByProjectId(projectId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('milestone_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "project_id_c"}}
        ],
        where: [{
          "FieldName": "project_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(projectId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching milestones by project:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('milestone_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "project_id_c"}}
        ]
      });

      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching milestone ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  prepareLookupFields(data) {
    const prepared = {...data};
    this.lookupFields.forEach(fieldName => {
      if (prepared[fieldName] !== undefined && prepared[fieldName] !== null) {
        // Handle both object and direct ID inputs
        prepared[fieldName] = prepared[fieldName]?.Id || parseInt(prepared[fieldName]);
      }
    });
    return prepared;
  }

  async create(milestoneData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Prepare lookup fields
      const preparedData = this.prepareLookupFields(milestoneData);

      const params = {
        records: [{
          Name: preparedData.title_c || preparedData.title || preparedData.Name,
          Tags: preparedData.Tags || "",
          title_c: preparedData.title_c || preparedData.title,
          description_c: preparedData.description_c || preparedData.description,
          due_date_c: preparedData.due_date_c || preparedData.dueDate,
          completed_c: preparedData.completed_c || preparedData.completed || false,
          project_id_c: preparedData.project_id_c || preparedData.projectId
        }]
      };

      const response = await apperClient.createRecord('milestone_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} milestones:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Milestone created successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating milestone:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, milestoneData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Prepare lookup fields
      const preparedData = this.prepareLookupFields(milestoneData);

      const params = {
        records: [{
          Id: parseInt(id),
          Name: preparedData.title_c || preparedData.title || preparedData.Name,
          Tags: preparedData.Tags || "",
          title_c: preparedData.title_c || preparedData.title,
          description_c: preparedData.description_c || preparedData.description,
          due_date_c: preparedData.due_date_c || preparedData.dueDate,
          completed_c: preparedData.completed_c || preparedData.completed,
          project_id_c: preparedData.project_id_c || preparedData.projectId
        }]
      };

      const response = await apperClient.updateRecord('milestone_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} milestones:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Milestone updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating milestone:", error?.response?.data?.message || error);
      return null;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('milestone_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} milestones:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Milestone deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error deleting milestone:", error?.response?.data?.message || error);
      return false;
    }
  }
}

export default new MilestoneService();
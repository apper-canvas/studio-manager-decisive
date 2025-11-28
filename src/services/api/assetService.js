import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

class AssetService {
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

      const response = await apperClient.fetchRecords('asset_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "file_name_c"}},
          {"field": {"Name": "file_type_c"}},
          {"field": {"Name": "file_size_c"}},
          {"field": {"Name": "project_id_c"}},
          {"field": {"Name": "thumbnail_url_c"}},
          {"field": {"Name": "file_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
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
      console.error("Error fetching assets:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByProjectId(projectId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('asset_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "file_name_c"}},
          {"field": {"Name": "file_type_c"}},
          {"field": {"Name": "file_size_c"}},
          {"field": {"Name": "project_id_c"}},
          {"field": {"Name": "thumbnail_url_c"}},
          {"field": {"Name": "file_c"}}
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
      console.error("Error fetching assets by project:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('asset_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "file_name_c"}},
          {"field": {"Name": "file_type_c"}},
          {"field": {"Name": "file_size_c"}},
          {"field": {"Name": "project_id_c"}},
          {"field": {"Name": "thumbnail_url_c"}},
          {"field": {"Name": "file_c"}}
        ]
      });

      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching asset ${id}:`, error?.response?.data?.message || error);
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

  async create(assetData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Prepare lookup fields
      const preparedData = this.prepareLookupFields(assetData);

      const params = {
        records: [{
          Name: preparedData.file_name_c || preparedData.fileName,
          Tags: preparedData.Tags || "",
          file_name_c: preparedData.file_name_c || preparedData.fileName,
          file_type_c: preparedData.file_type_c || preparedData.fileType,
          file_size_c: preparedData.file_size_c || preparedData.fileSize,
          project_id_c: preparedData.project_id_c || preparedData.projectId,
          thumbnail_url_c: preparedData.thumbnail_url_c || [],
          file_c: preparedData.file_c || []
        }]
      };

      const response = await apperClient.createRecord('asset_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} assets:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Asset created successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating asset:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, assetData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Prepare lookup fields
      const preparedData = this.prepareLookupFields(assetData);

      const params = {
        records: [{
          Id: parseInt(id),
          Name: preparedData.file_name_c || preparedData.fileName,
          Tags: preparedData.Tags || "",
          file_name_c: preparedData.file_name_c || preparedData.fileName,
          file_type_c: preparedData.file_type_c || preparedData.fileType,
          file_size_c: preparedData.file_size_c || preparedData.fileSize,
          project_id_c: preparedData.project_id_c || preparedData.projectId
        }]
      };

      const response = await apperClient.updateRecord('asset_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} assets:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Asset updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating asset:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord('asset_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} assets:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Asset deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error deleting asset:", error?.response?.data?.message || error);
      return false;
    }
  }
}

export default new AssetService();
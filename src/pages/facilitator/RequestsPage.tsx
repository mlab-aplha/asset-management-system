import React, { useState } from 'react';
import RequestList from '../../features/facilitator/request-management/RequestList';
import RequestDetails from '../../features/facilitator/request-management/RequestDetails';
import { useAssignmentRequests } from '../../features/facilitator/asset-assignment/hooks';
import { AssignmentRequestService } from '../../../backend-firebase/src/services/AssignmentRequestService';

const RequestsPage: React.FC = () => {
  const { requests, loading, refresh } = useAssignmentRequests();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const handleApprove = async (id: string, notes?: string) => {
    const result = await AssignmentRequestService.approve(id, 'facilitator-id', 'Facilitator', notes);
    if (result.success) {
      refresh();
      setSelectedRequest(null);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    const result = await AssignmentRequestService.reject(id, 'facilitator-id', reason);
    if (result.success) {
      refresh();
      setSelectedRequest(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Assignment Requests</h1>
      <RequestList
        requests={requests}
        loading={loading}
        onApprove={(id) => handleApprove(id)}
        onReject={(id) => handleReject(id, 'No reason provided')}
        onView={(id) => setSelectedRequest(requests.find(r => r.id === id))}
        onRefresh={refresh}
      />
      {selectedRequest && (
        <RequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default RequestsPage;

import React from 'react';
import { 
  FiClock, 
  FiCheckCircle, 
  FiPackage, 
  FiTruck,
  FiXCircle,
  FiCheck
} from 'react-icons/fi';

const OrderTimeline = ({ status, createdAt, updatedAt }) => {

  // Timeline steps
  const steps = [
    {
      key: 'pending',
      label: 'Order Placed',
      desc: 'Your order has been placed',
      icon: <FiClock />,
      color: '#f59e0b'
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      desc: 'Seller has confirmed your order',
      icon: <FiCheckCircle />,
      color: '#3b82f6'
    },
    {
      key: 'completed',
      label: 'Completed',
      desc: 'Order delivered successfully',
      icon: <FiPackage />,
      color: '#10b981'
    }
  ];

  // Get step index
  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'completed': return 2;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(status);
  const isCancelled = status === 'cancelled';

  // Format date
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Cancelled State
  if (isCancelled) {
    return (
      <div className="order-timeline">
        <div className="timeline-cancelled">
          <div className="cancelled-icon">
            <FiXCircle />
          </div>
          <div className="cancelled-text">
            <h4>Order Cancelled</h4>
            <p>This order has been cancelled</p>
            <span>{formatDateTime(updatedAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-timeline">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div key={step.key} className="timeline-item">
            {/* Step */}
            <div className="timeline-step">
              <div className={`
                timeline-icon 
                ${isCompleted ? 'completed' : ''} 
                ${isActive ? 'active' : ''} 
                ${isPending ? 'pending' : ''}
              `}
                style={{
                  '--step-color': step.color
                }}
              >
                {isCompleted ? <FiCheck /> : step.icon}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`timeline-line ${isCompleted ? 'completed' : ''}`}></div>
              )}
            </div>

            {/* Content */}
            <div className={`timeline-content ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}>
              <h4>{step.label}</h4>
              <p>{step.desc}</p>
              {isActive && (
                <span className="timeline-date">
                  {formatDateTime(index === 0 ? createdAt : updatedAt)}
                </span>
              )}
              {isCompleted && (
                <span className="timeline-date completed">
                  ✓ Done
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
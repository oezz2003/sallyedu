import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { testFirebaseConnection, courseService, userService, enrollmentService, paymentService } from '@/lib/firebaseService';

interface ConnectionStatus {
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function FirebaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'idle',
    message: 'Click "Test Connection" to verify Firebase connectivity'
  });

  const [serviceTests, setServiceTests] = useState<Record<string, ConnectionStatus>>({});

  const testConnection = async () => {
    setConnectionStatus({ status: 'testing', message: 'Testing Firebase connection...' });
    
    try {
      const isConnected = await testFirebaseConnection();
      
      if (isConnected) {
        setConnectionStatus({
          status: 'success',
          message: 'Firebase connection successful!'
        });
      } else {
        setConnectionStatus({
          status: 'error',
          message: 'Firebase connection failed. Check console for details.'
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: 'Connection test failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const testServices = async () => {
    const services = [
      { name: 'Courses', service: courseService },
      { name: 'Users', service: userService },
      { name: 'Enrollments', service: enrollmentService },
      { name: 'Payments', service: paymentService }
    ];

    setServiceTests({});

    for (const { name, service } of services) {
      setServiceTests(prev => ({
        ...prev,
        [name]: { status: 'testing', message: `Testing ${name} service...` }
      }));

      try {
        const result = await service.getAll([], undefined, 'desc', 1);
        setServiceTests(prev => ({
          ...prev,
          [name]: {
            status: 'success',
            message: `${name} service working`,
            details: `Found ${result.data.length} documents`
          }
        }));
      } catch (error) {
        setServiceTests(prev => ({
          ...prev,
          [name]: {
            status: 'error',
            message: `${name} service failed`,
            details: error instanceof Error ? error.message : String(error)
          }
        }));
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'testing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Firebase Connection Diagnostics</CardTitle>
        <CardDescription>
          Test Firebase connectivity and service availability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Test */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button onClick={testConnection} disabled={connectionStatus.status === 'testing'}>
              {connectionStatus.status === 'testing' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Test Connection
            </Button>
            <Button onClick={testServices} variant="outline" disabled={Object.values(serviceTests).some(test => test.status === 'testing')}>
              Test Services
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon(connectionStatus.status)}
            <Badge variant={getStatusVariant(connectionStatus.status)}>
              {connectionStatus.message}
            </Badge>
          </div>
          
          {connectionStatus.details && (
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {connectionStatus.details}
            </div>
          )}
        </div>

        {/* Service Tests */}
        {Object.keys(serviceTests).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Service Tests</h4>
            {Object.entries(serviceTests).map(([serviceName, test]) => (
              <div key={serviceName} className="flex items-center gap-2">
                {getStatusIcon(test.status)}
                <span className="text-sm font-medium">{serviceName}:</span>
                <Badge variant={getStatusVariant(test.status)} className="text-xs">
                  {test.message}
                </Badge>
                {test.details && (
                  <span className="text-xs text-muted-foreground">
                    ({test.details})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Connection Test:</strong> Verifies basic Firebase connectivity</p>
          <p><strong>Service Tests:</strong> Tests each individual service (courses, users, etc.)</p>
          <p>Check browser console for detailed error logs if tests fail</p>
        </div>
      </CardContent>
    </Card>
  );
}
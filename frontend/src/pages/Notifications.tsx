
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: number;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

const mockNotifications: Notification[] = Array.from({ length: 75 }, (_, i) => ({
  id: i + 1,
  title: `Notification ${i + 1}`,
  description: `This is the detailed description for notification ${i + 1}. It contains more information about what happened.`,
  date: new Date(Date.now() - i * 86400000).toISOString(),
  read: i > 4
}));

const Notifications = () => {
  const { notificationId } = useParams<{ notificationId?: string }>();
  const [expandedIds, setExpandedIds] = useState<number[]>(notificationId ? [parseInt(notificationId)] : []);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const itemsPerPage = 50;
  const totalPages = Math.ceil(mockNotifications.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = mockNotifications.slice(startIndex, startIndex + itemsPerPage);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const toggleExpand = (id: number) => {
    setExpandedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };
  
  const markAsRead = (id: number) => {
    toast({
      title: "Notification marked as read",
      duration: 2000,
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      
      <div className="space-y-4 mb-6">
        {paginatedNotifications.map(notification => (
          <Card key={notification.id}>
            <CardHeader className="p-4 cursor-pointer" onClick={() => toggleExpand(notification.id)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  {notification.title}
                  {!notification.read && (
                    <span className="ml-2 h-2 w-2 rounded-full bg-blue-500"></span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(notification.date)}
                  </span>
                  {expandedIds.includes(notification.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            {expandedIds.includes(notification.id) && (
              <CardContent className="px-4 pb-4 pt-0">
                <p className="text-muted-foreground mb-4">
                  {notification.description}
                </p>
                {!notification.read && (
                  <Button size="sm" onClick={() => markAsRead(notification.id)}>
                    Mark as read
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Calculate the page numbers to display
            let pageNum = currentPage;
            if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            // Only render if the page is within range
            if (pageNum > 0 && pageNum <= totalPages) {
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNum)}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            return null;
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Notifications;

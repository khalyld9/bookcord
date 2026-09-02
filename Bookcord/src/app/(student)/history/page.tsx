import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IssueStatusBadge } from "@/components/issues/status-badge";
import { requireUser } from "@/lib/auth";
import { getMyIssues } from "@/lib/data/issues";
import { formatDate } from "@/lib/utils";

export default async function HistoryPage() {
  const { profile } = await requireUser();
  const issues = await getMyIssues(profile);

  return (
    
      
        Borrowing History
        
          A complete record of books you have borrowed.
        
      
      
        
          
            
              Book
              Quantity
              Date Issued
              Expected Return
              Status
            
          
          
            {issues.length === 0 ? (
              
                
                  No borrowing history yet.
                
              
            ) : (
              issues.map((issue) => (
                
                  
                    {issue.books?.title ?? "Unknown book"}
                  
                  {issue.quantity}
                  {formatDate(issue.date_issued)}
                  
                    {issue.expected_return_date
                      ? formatDate(issue.expected_return_date)
                      : "—"}
                  
                  
                    
                  
                
              ))
            )}
          
        
      
    
  );
}

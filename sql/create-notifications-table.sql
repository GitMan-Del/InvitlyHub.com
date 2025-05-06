-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Create RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for system to insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_action_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, action_url)
  VALUES (p_user_id, p_title, p_message, p_type, p_action_url)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to create notifications on event creation
CREATE OR REPLACE FUNCTION notify_on_event_creation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.user_id,
    'New Event Created',
    'You have successfully created a new event: ' || NEW.title,
    'success',
    '/events/' || NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for event creation
DROP TRIGGER IF EXISTS event_creation_notification ON events;
CREATE TRIGGER event_creation_notification
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION notify_on_event_creation();

-- Create trigger function to create notifications on invitation response
CREATE OR REPLACE FUNCTION notify_on_invitation_response()
RETURNS TRIGGER AS $$
DECLARE
  event_title TEXT;
  event_owner_id UUID;
BEGIN
  -- Only trigger on status change from pending
  IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
    -- Get event title and owner
    SELECT title, user_id INTO event_title, event_owner_id
    FROM events
    WHERE id = NEW.event_id;
    
    -- Create notification for event owner
    PERFORM create_notification(
      event_owner_id,
      'Invitation Response',
      NEW.name || ' has ' || 
      CASE 
        WHEN NEW.status = 'yes' THEN 'accepted'
        WHEN NEW.status = 'no' THEN 'declined'
        ELSE 'responded to'
      END || 
      ' your invitation to ' || event_title,
      CASE 
        WHEN NEW.status = 'yes' THEN 'success'
        WHEN NEW.status = 'no' THEN 'info'
        ELSE 'info'
      END,
      '/events/' || NEW.event_id || '/guests'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invitation response
DROP TRIGGER IF EXISTS invitation_response_notification ON invitations;
CREATE TRIGGER invitation_response_notification
AFTER UPDATE ON invitations
FOR EACH ROW
EXECUTE FUNCTION notify_on_invitation_response();

-- Update the handle_new_user function to include all required fields for new users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (id, email, subscription_tier)
    VALUES (NEW.id, NEW.email, 'free');
    
    -- Insert default user settings with folders
    INSERT INTO public.user_settings (
        user_id, 
        measurement, 
        currency, 
        language, 
        show_tooltips,
        folders,
        shipment_folders
    )
    VALUES (
        NEW.id, 
        'metric', 
        'USD', 
        'en', 
        true,
        '[
            {"id": "1", "name": "Q1 2024"},
            {"id": "2", "name": "Electronics"},
            {"id": "3", "name": "Archived"}
        ]',
        '{}'
    );
    
    -- Insert default subscription
    INSERT INTO public.user_subscriptions (user_id, subscription_tier, status)
    VALUES (NEW.id, 'free', 'active');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
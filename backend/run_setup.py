#!/usr/bin/env python3
"""
Setup script for Jewellery CRM Django backend
This script will:
1. Run migrations
2. Create demo users
3. Start the development server
"""

import os
import sys
import subprocess
import django
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"\n{description}...")
    print(f"Running: {command}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        print(f"Error: {e}")
        if e.stdout:
            print(f"Output: {e.stdout}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        return False

def main():
    print("🚀 Setting up Jewellery CRM Django Backend")
    print("=" * 50)
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Step 1: Install dependencies (if needed)
    print("\n📦 Checking dependencies...")
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        print("⚠️  Dependencies installation failed, continuing...")
    
    # Step 2: Run migrations
    if not run_command("python manage.py makemigrations", "Creating migrations"):
        print("⚠️  Migration creation failed, continuing...")
    
    if not run_command("python manage.py migrate", "Running migrations"):
        print("❌ Migration failed, cannot continue")
        return False
    
    # Step 3: Create demo users
    if not run_command("python setup_users.py", "Creating demo users"):
        print("⚠️  Demo user creation failed, continuing...")
    
    # Step 4: Collect static files
    if not run_command("python manage.py collectstatic --noinput", "Collecting static files"):
        print("⚠️  Static file collection failed, continuing...")
    
    print("\n✅ Backend setup completed!")
    print("\n🎯 Next steps:")
    print("1. Start the Django server: python manage.py runserver")
    print("2. Start the Next.js frontend: npm run dev")
    print("3. Access the application at: http://localhost:3000")
    
    # Ask if user wants to start the server
    response = input("\n🚀 Would you like to start the Django server now? (y/n): ")
    if response.lower() in ['y', 'yes']:
        print("\n🌐 Starting Django development server...")
        print("Server will be available at: http://localhost:8000")
        print("API endpoints will be available at: http://localhost:8000/api/")
        print("Press Ctrl+C to stop the server")
        
        try:
            subprocess.run("python manage.py runserver", shell=True)
        except KeyboardInterrupt:
            print("\n👋 Server stopped by user")
    
    return True

if __name__ == '__main__':
    try:
        success = main()
        if success:
            print("\n🎉 Setup completed successfully!")
        else:
            print("\n❌ Setup failed!")
            sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1) 
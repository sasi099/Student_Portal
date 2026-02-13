#!/usr/bin/env python3
"""
Script to update subject list items to include upload/delete buttons for master
"""

import re
import os

# Subject mappings for each branch and semester
SUBJECTS = {
    'AI&ML': {
        '1-2': [
            ('🔢 Mathematics – II (Linear Algebra & Numerical Methods)', 'Mathematics – II'),
            ('🧪 Applied Physics / Applied Chemistry', 'Applied Physics'),
            ('📊 Data Structures using C', 'Data Structures using C'),
            ('⚡ Digital Logic Design', 'Digital Logic Design'),
            ('📐 Engineering Graphics', 'Engineering Graphics'),
        ],
        '2-1': [
            ('🔢 Mathematics – III (Probability & Statistics)', 'Mathematics – III'),
            ('☕ Object Oriented Programming using Java', 'Object Oriented Programming'),
            ('🖥️ Computer Organization', 'Computer Organization'),
            ('🧮 Discrete Mathematics', 'Discrete Mathematics'),
            ('🤖 Artificial Intelligence', 'Artificial Intelligence'),
        ],
        '2-2': [
            ('📈 Design & Analysis of Algorithms', 'Design & Analysis of Algorithms'),
            ('🖥️ Operating Systems', 'Operating Systems'),
            ('💾 Database Management Systems', 'Database Management Systems'),
            ('🏗️ Software Engineering', 'Software Engineering'),
            ('🤖 Machine Learning', 'Machine Learning'),
        ],
        '3-1': [
            ('📚 Compiler Design', 'Compiler Design'),
            ('🌐 Computer Networks', 'Computer Networks'),
            ('🕷️ Web Technologies', 'Web Technologies'),
            ('🧠 Deep Learning', 'Deep Learning'),
            ('📖 Professional Elective-I', 'Professional Elective-I'),
        ],
        '3-2': [
            ('📊 Big Data Analytics', 'Big Data Analytics'),
            ('☁️ Cloud Computing', 'Cloud Computing'),
            ('📡 Internet of Things', 'Internet of Things'),
            ('📖 Professional Elective-II', 'Professional Elective-II'),
            ('🎓 Open Elective-I', 'Open Elective-I'),
        ],
        '4-1': [
            ('🔐 Cyber Security', 'Cyber Security'),
            ('📖 Professional Elective-III', 'Professional Elective-III'),
            ('🎓 Open Elective-II', 'Open Elective-II'),
            ('🔧 Minor Project', 'Minor Project'),
            ('📢 Seminar', 'Seminar'),
        ],
        '4-2': [
            ('📖 Professional Elective-IV', 'Professional Elective-IV'),
            ('🎓 Open Elective-III', 'Open Elective-III'),
            ('🏆 Major Project', 'Major Project'),
        ],
    }
}

def create_subject_item_html(icon_and_name, search_name, branch):
    """Create HTML for a subject item with upload/delete buttons"""
    return f'''    <li class="subject-item">
      <div class="subject-name">
        <span>{icon_and_name}</span><br>
        <a href="File not Uploaded" download style="font-size: 0.9rem; color: #6fa8d6;">
          <button style="padding: 4px 8px; font-size: 0.8rem;">Download</button>
        </a>
      </div>
      <div class="subject-actions">
        <button class="upload-btn" onclick="uploadSubjectFile('{branch}', '{search_name}')">Upload</button>
        <button class="delete-btn" onclick="deleteSubjectFile('{search_name}')">Delete</button>
      </div>
    </li>'''

def update_file(filepath, branch):
    """Update a subject file with new upload/delete buttons"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to find old study materials sections
    # Replace uploadFile calls with new functions
    content = content.replace('onclick="uploadFile(', 'onclick="uploadSubjectFile(')
    
    print(f"Updated {filepath}")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Update all three files
files_to_update = [
    ('C:\\Users\\chait_3nqi8l8\\Downloads\\Students_Portal-main\\Students_Portal-main\\AI&ML S-1.html', 'AI&ML'),
    ('C:\\Users\\chait_3nqi8l8\\Downloads\\Students_Portal-main\\Students_Portal-main\\CSE S-1.HTML', 'CSE'),
    ('C:\\Users\\chait_3nqi8l8\\Downloads\\Students_Portal-main\\Students_Portal-main\\ECE S-1.html', 'ECE'),
]

for filepath, branch in files_to_update:
    if os.path.exists(filepath):
        update_file(filepath, branch)
        print(f"✅ {filepath} updated successfully")
    else:
        print(f"❌ File not found: {filepath}")

print("\n✅ All files have been updated to use the new upload/delete button structure")

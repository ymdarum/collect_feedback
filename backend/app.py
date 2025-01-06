from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import pandas as pd
from datetime import datetime
import os
# No dotenv is used in this code
import pytz

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'genai_tests'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# Public API endpoints
@app.route('/api/divisions', methods=['GET'])
def get_divisions():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM divisions")
        divisions = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(divisions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/venues', methods=['GET'])
def get_venues():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM venues")
        venues = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(venues), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/submit-feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json
        print(f"Received data: {data}")
        
        if not data or 'tester_name' not in data or 'division_id' not in data or 'venue_id' not in data:
            return jsonify({"error": "Invalid data"}), 400

        # Convert session_datetime to GMT+8
        local_tz = pytz.timezone('Asia/Singapore')  # GMT+8
        session_datetime = datetime.fromisoformat(data['session_datetime'].replace('Z', '+00:00')).astimezone(local_tz)

        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert feedback session
        session_query = """
            INSERT INTO feedback_sessions 
            (tester_name, division_id, venue_id, session_datetime, total_score, accuracy_score, relevancy_score, performance_score) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Calculate average scores
        responses = data['responses']
        avg_accuracy = sum(r['accuracy_score'] for r in responses) / len(responses)
        avg_relevancy = sum(r['relevancy_score'] for r in responses) / len(responses)
        avg_performance = sum(r['performance_score'] for r in responses) / len(responses)
        total_score = (avg_accuracy + avg_relevancy + avg_performance) / 3

        session_values = (
            data['tester_name'],
            data['division_id'],
            data['venue_id'],
            session_datetime,
            total_score,
            avg_accuracy,
            avg_relevancy,
            avg_performance
        )
        
        cursor.execute(session_query, session_values)
        session_id = cursor.lastrowid

        # Insert feedback responses
        response_query = """
            INSERT INTO feedback_responses 
            (session_id, question, chatbot_answer, accuracy_score, relevancy_score, performance_score, additional_comments)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        for response in data['responses']:
            response_values = (
                session_id,
                response['question'],
                response['chatbot_answer'],
                response['accuracy_score'],
                response['relevancy_score'],
                response['performance_score'],
                response.get('additional_comments', '')
            )
            cursor.execute(response_query, response_values)

        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Feedback submitted successfully", "session_id": session_id}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/feedback-sessions', methods=['GET'])
def get_all_feedback_sessions():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT fs.*, d.name as division_name, v.name as venue_name,
                   GROUP_CONCAT(fr.question) as questions,
                   GROUP_CONCAT(fr.chatbot_answer) as answers,
                   GROUP_CONCAT(fr.additional_comments) as comments
            FROM feedback_sessions fs
            LEFT JOIN divisions d ON fs.division_id = d.id
            LEFT JOIN venues v ON fs.venue_id = v.id
            LEFT JOIN feedback_responses fr ON fs.id = fr.session_id
            GROUP BY fs.id
            ORDER BY fs.created_at DESC
        """
        
        cursor.execute(query)
        sessions = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return jsonify(sessions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/feedback-session/<int:session_id>', methods=['GET', 'PUT'])
def manage_feedback_session(session_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        if request.method == 'GET':
            # Get session details with responses
            query = """
                SELECT fs.*, d.name as division_name, v.name as venue_name,
                       fr.id as response_id, fr.question, fr.chatbot_answer,
                       fr.accuracy_score, fr.relevancy_score, fr.performance_score,
                       fr.additional_comments
                FROM feedback_sessions fs
                LEFT JOIN divisions d ON fs.division_id = d.id
                LEFT JOIN venues v ON fs.venue_id = v.id
                LEFT JOIN feedback_responses fr ON fs.id = fr.session_id
                WHERE fs.id = %s
            """
            cursor.execute(query, (session_id,))
            results = cursor.fetchall()
            
            if not results:
                return jsonify({"error": "Session not found"}), 404
                
            # Format the response
            session = results[0]
            responses = []
            for row in results:
                if row['response_id']:
                    responses.append({
                        'id': row['response_id'],
                        'question': row['question'],
                        'chatbot_answer': row['chatbot_answer'],
                        'accuracy_score': row['accuracy_score'],
                        'relevancy_score': row['relevancy_score'],
                        'performance_score': row['performance_score'],
                        'additional_comments': row['additional_comments']
                    })
            
            session['responses'] = responses
            return jsonify(session), 200
            
        elif request.method == 'PUT':
            data = request.json
            
            # Update session
            update_query = """
                UPDATE feedback_sessions
                SET tester_name = %s, division_id = %s, venue_id = %s,
                    session_datetime = %s, total_score = %s
                WHERE id = %s
            """
            cursor.execute(update_query, (
                data['tester_name'],
                data['division_id'],
                data['venue_id'],
                datetime.fromisoformat(data['session_datetime'].replace('Z', '+00:00')),
                data['total_score'],
                session_id
            ))
            
            # Update responses
            for response in data['responses']:
                if 'id' in response:
                    # Update existing response
                    update_response_query = """
                        UPDATE feedback_responses
                        SET question = %s, chatbot_answer = %s,
                            accuracy_score = %s, relevancy_score = %s,
                            performance_score = %s, additional_comments = %s
                        WHERE id = %s AND session_id = %s
                    """
                    cursor.execute(update_response_query, (
                        response['question'],
                        response['chatbot_answer'],
                        response['accuracy_score'],
                        response['relevancy_score'],
                        response['performance_score'],
                        response.get('additional_comments', ''),
                        response['id'],
                        session_id
                    ))
                else:
                    # Insert new response
                    insert_response_query = """
                        INSERT INTO feedback_responses
                        (session_id, question, chatbot_answer, accuracy_score,
                         relevancy_score, performance_score, additional_comments)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    cursor.execute(insert_response_query, (
                        session_id,
                        response['question'],
                        response['chatbot_answer'],
                        response['accuracy_score'],
                        response['relevancy_score'],
                        response['performance_score'],
                        response.get('additional_comments', '')
                    ))
            
            conn.commit()
            return jsonify({"message": "Session updated successfully"}), 200
            
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Admin API endpoints
@app.route('/api/admin/division', methods=['POST'])
def add_division():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO divisions (name) VALUES (%s)", (data['name'],))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Division added successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/venue', methods=['POST'])
def add_venue():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO venues (name) VALUES (%s)", (data['name'],))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Venue added successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/divisions', methods=['GET'])
def get_all_divisions():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM divisions")
        divisions = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(divisions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/venues', methods=['GET'])
def get_all_venues():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM venues")
        venues = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(venues), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/division/<int:division_id>', methods=['DELETE'])
def delete_division(division_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Check if division is being used in feedback sessions
        cursor.execute("SELECT COUNT(*) FROM feedback_sessions WHERE division_id = %s", (division_id,))
        count = cursor.fetchone()[0]
        if count > 0:
            return jsonify({"error": "Cannot delete division as it is being used in feedback sessions"}), 400
        
        cursor.execute("DELETE FROM divisions WHERE id = %s", (division_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Division deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/venue/<int:venue_id>', methods=['DELETE'])
def delete_venue(venue_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Check if venue is being used in feedback sessions
        cursor.execute("SELECT COUNT(*) FROM feedback_sessions WHERE venue_id = %s", (venue_id,))
        count = cursor.fetchone()[0]
        if count > 0:
            return jsonify({"error": "Cannot delete venue as it is being used in feedback sessions"}), 400
        
        cursor.execute("DELETE FROM venues WHERE id = %s", (venue_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Venue deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/venue/<int:venue_id>', methods=['PUT'])
def update_venue(venue_id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE venues SET name = %s WHERE id = %s", (data['name'], venue_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Venue updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/division/<int:division_id>', methods=['PUT'])
def update_division(division_id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE divisions SET name = %s WHERE id = %s", (data['name'], division_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Division updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.errorhandler(Exception)
def handle_error(error):
    print(f"Error: {str(error)}")
    response = {"error": str(error)}
    if hasattr(error, 'code'):
        return jsonify(response), error.code
    return jsonify(response), 500

@app.route('/api/admin/feedback-session/<int:session_id>', methods=['PUT'])
def update_feedback_session(session_id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()

        # Log the incoming data for debugging
        print(f"Updating session {session_id} with data: {data}")

        # Convert session_datetime to a valid format
        session_datetime = datetime.strptime(data['session_datetime'], '%a, %d %b %Y %H:%M:%S %Z')

        # Update the feedback session
        update_query = """
            UPDATE feedback_sessions
            SET tester_name = %s, division_id = %s, venue_id = %s,
                session_datetime = %s
            WHERE id = %s
        """
        cursor.execute(update_query, (
            data['tester_name'],
            data['division_id'],
            data['venue_id'],
            session_datetime,
            session_id
        ))

        # Update responses
        for response in data['responses']:
            if 'id' in response:
                # Update existing response
                update_response_query = """
                    UPDATE feedback_responses
                    SET question = %s, chatbot_answer = %s,
                        accuracy_score = %s, relevancy_score = %s,
                        performance_score = %s, additional_comments = %s
                    WHERE id = %s AND session_id = %s
                """
                cursor.execute(update_response_query, (
                    response['question'],
                    response['chatbot_answer'],
                    response['accuracy_score'],
                    response['relevancy_score'],
                    response['performance_score'],
                    response.get('additional_comments', ''),
                    response['id'],
                    session_id
                ))
            else:
                # Insert new response
                insert_response_query = """
                    INSERT INTO feedback_responses
                    (session_id, question, chatbot_answer, accuracy_score,
                     relevancy_score, performance_score, additional_comments)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(insert_response_query, (
                    session_id,
                    response['question'],
                    response['chatbot_answer'],
                    response['accuracy_score'],
                    response['relevancy_score'],
                    response['performance_score'],
                    response.get('additional_comments', '')
                ))

        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Session updated successfully"}), 200
    except Exception as e:
        print(f"Error updating session: {e}")  # Log the error
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/feedback-session/<int:session_id>', methods=['DELETE'])
def delete_feedback_session(session_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if the feedback session exists
        cursor.execute("SELECT COUNT(*) FROM feedback_sessions WHERE id = %s", (session_id,))
        count = cursor.fetchone()[0]
        if count == 0:
            return jsonify({"error": "Feedback session not found"}), 404
        
        # Delete the feedback session
        cursor.execute("DELETE FROM feedback_sessions WHERE id = %s", (session_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        return jsonify({"message": "Feedback session deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 
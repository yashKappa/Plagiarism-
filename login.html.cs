using System;
using System.Data;
using System.Data.SqlClient;
using System.Windows.Forms; // Add this for Windows Forms

private void LoginButton_Click(object sender, EventArgs e)
{
    string connectionString = "YourConnectionStringHere";
    
    using (SqlConnection con = new SqlConnection(connectionString))
    {
        try
        {
            con.Open();
            SqlCommand cmd = new SqlCommand("Select count(*) from student where username='" + Textu.Text + "' and password='" + Textp.Text + "'", con);
            SqlDataAdapter sda = new SqlDataAdapter(cmd);
            DataTable dt = new DataTable();
            sda.Fill(dt);
            
            if (dt.Rows[0][0].ToString() == "1")
            {
                MessageBox.Show("Successful login");
                // Redirect or perform further actions here
            }
            else
            {
                MessageBox.Show("Unsuccessful login");
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show(ex.Message);
        }
    }
}